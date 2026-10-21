import { ReactRenderer } from "@tiptap/react"
import type { SuggestionOptions, SuggestionProps } from "@tiptap/suggestion"
import { loadMentionEntries } from "@/lib/mention-entries"
import { normalize } from "@/lib/world-search"
import type { WorldScope } from "@/lib/world-scope"
import { MentionList } from "./MentionList"
import type { MentionItem, MentionListHandle, MentionListProps } from "./MentionList"

const MAX_ITEMS = 8
const GAP = 4

// What @ offers: the entries of the scope that match what was typed, names
// starting with it first. The entry being edited is left out.
async function items(scope: WorldScope, exceptId: string, query: string): Promise<MentionItem[]> {
  const words = normalize(query).split(/\s+/).filter(Boolean)
  const found = (await loadMentionEntries(scope))
    .filter((entry) => entry.id !== exceptId)
    .map((entry) => ({ entry, name: normalize(entry.name) }))
    .filter(({ name }) => words.every((word) => name.includes(word)))
    .sort(
      (a, b) =>
        Number(b.name.startsWith(words[0] ?? "")) - Number(a.name.startsWith(words[0] ?? "")) ||
        a.name.localeCompare(b.name)
    )

  return found.slice(0, MAX_ITEMS).map(({ entry }) => ({
    id: entry.id,
    label: entry.name,
    kind: entry.kind,
    hidden: scope.hasVisibility && !entry.revealed,
  }))
}

// The picker lives inside the editor's own box, not on the page: a panel that
// is a dialog counts a click outside itself as a reason to close.
function render() {
  let component: ReactRenderer<MentionListHandle, MentionListProps> | null = null

  function place(props: SuggestionProps<MentionItem>) {
    const root = props.editor.view.dom.closest<HTMLElement>("[data-mention-root]")
    const caret = props.clientRect?.()
    if (!component || !root || !caret) return

    if (component.element.parentElement !== root) root.appendChild(component.element)
    const box = root.getBoundingClientRect()
    const style = component.element.style
    style.position = "absolute"
    style.zIndex = "60"
    style.left = `${caret.left - box.left}px`
    // Below the caret, or above it when the screen ends first.
    if (caret.bottom + 260 < window.innerHeight) {
      style.top = `${caret.bottom - box.top + GAP}px`
      style.bottom = ""
    } else {
      style.top = ""
      style.bottom = `${box.bottom - caret.top + GAP}px`
    }
  }

  return {
    onStart: (props: SuggestionProps<MentionItem>) => {
      component = new ReactRenderer(MentionList, { props, editor: props.editor })
      place(props)
    },
    onUpdate: (props: SuggestionProps<MentionItem>) => {
      component?.updateProps(props)
      place(props)
    },
    onKeyDown: ({ event }: { event: KeyboardEvent }) =>
      component?.ref?.onKeyDown(event) ?? false,
    onExit: () => {
      component?.element.remove()
      component?.destroy()
      component = null
    },
  }
}

export function mentionSuggestion(
  scope: WorldScope,
  exceptId: string
): Omit<SuggestionOptions<MentionItem>, "editor"> {
  return {
    char: "@",
    items: ({ query }) => items(scope, exceptId, query),
    render,
  }
}
