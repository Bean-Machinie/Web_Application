import { PluginKey } from "@tiptap/pm/state"
import type { SuggestionOptions } from "@tiptap/suggestion"
import { loadMentionEntries } from "@/lib/mention-entries"
import { normalize } from "@/lib/world-search"
import type { WorldEntry } from "@/lib/world-entries"
import type { WorldScope } from "@/lib/world-scope"
import { MentionList } from "./MentionList"
import type { MentionItem } from "./MentionList"
import { suggestionRender } from "./suggestion-render"

const MAX_ITEMS = 8
const MENTION_KEY = new PluginKey("mentionPicker")

// The entries that match what was typed, names starting with it first. The entry
// being edited is left out. Shared by @ and the format bar's link menu.
export function matchingEntries(entries: WorldEntry[], exceptId: string, query: string): WorldEntry[] {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  return entries
    .filter((entry) => entry.id !== exceptId)
    .map((entry) => ({ entry, name: normalize(entry.name) }))
    .filter(({ name }) => words.every((word) => name.includes(word)))
    .sort(
      (a, b) =>
        Number(b.name.startsWith(words[0] ?? "")) - Number(a.name.startsWith(words[0] ?? "")) ||
        a.name.localeCompare(b.name)
    )
    .map(({ entry }) => entry)
}

async function items(scope: WorldScope, exceptId: string, query: string): Promise<MentionItem[]> {
  const found = matchingEntries(await loadMentionEntries(scope), exceptId, query)

  return found.slice(0, MAX_ITEMS).map((entry) => ({
    id: entry.id,
    label: entry.name,
    kind: entry.kind,
    hidden: scope.hasVisibility && !entry.revealed,
  }))
}

export function mentionSuggestion(
  scope: WorldScope,
  exceptId: string
): Omit<SuggestionOptions<MentionItem>, "editor"> {
  return {
    char: "@",
    // Only the chip: the default adds a space after it, which leaves a gap before
    // a comma or a full stop typed next.
    command: ({ editor, range, props }) => {
      editor
        .chain()
        .focus()
        .insertContentAt(range, { type: "mention", attrs: { id: props.id, label: props.label } })
        .run()
    },
    items: ({ query }) => items(scope, exceptId, query),
    pluginKey: MENTION_KEY,
    render: suggestionRender(MentionList, MENTION_KEY),
  }
}
