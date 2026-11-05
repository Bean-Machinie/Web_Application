import { useMemo, useState } from "react"
import type { Editor } from "@tiptap/react"
import { AtSign } from "lucide-react"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { SearchIcon } from "@/components/icons/SearchIcon"
import { Input } from "@/components/ui/input"
import { useMentionEntries } from "@/hooks/use-mention-entries"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { WorldEntry } from "@/lib/world-entries"
import { FadingScroll } from "./FadingScroll"
import { FormatPopover } from "./FormatPopover"
import type { MenuControl } from "./format-menu-switch"
import { HiddenBadge } from "./HiddenBadge"
import { matchingEntries } from "./mention-suggestion"
import { useMentionScope } from "./useMentionScope"

type Props = { editor: Editor; exceptId: string; control: MenuControl; onClosed: () => void }

// The entries that @ offers, from the format bar, with a search. Where there is no world
// around the editor there is nothing to link to, and the button is not there. A chosen
// entry takes the place of the selected text, as @ takes the place of what was typed.
export function FormatMentionMenu({ editor, exceptId, control, onClosed }: Props) {
  const scope = useMentionScope()
  const entries = useMentionEntries(scope)
  const [query, setQuery] = useState("")
  const shown = useMemo(() => (entries ? matchingEntries(entries, exceptId, query) : []), [entries, exceptId, query])

  if (!scope) return null

  const pick = (entry: WorldEntry) => {
    control.choose(null, control.id)
    editor.chain().focus().insertContent({ type: "mention", attrs: { id: entry.id, label: entry.name } }).run()
  }

  return (
    <FormatPopover
      label="Link an entry"
      icon={AtSign}
      control={control}
      onClosed={() => {
        setQuery("")
        onClosed()
      }}
    >
      <div className="relative p-1 pb-0">
        <HoverIcon
          icon={SearchIcon}
          size={16}
          hoverParent
          className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 -translate-y-[calc(50%-2px)]"
        />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && shown[0]) pick(shown[0])
          }}
          placeholder="Search entries"
          aria-label="Search entries"
          className="pl-8"
        />
      </div>
      <FadingScroll maxHeight="min(16rem, var(--radix-popover-content-available-height))">
        <div className="p-1">
          {shown.length === 0 ? (
            <p className="text-muted-foreground px-2 py-3 text-center text-xs">
              {entries ? "No entries found" : "Loading…"}
            </p>
          ) : (
            shown.map((entry) => {
              const { icon: Icon } = WORLD_KINDS[entry.kind]
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => pick(entry)}
                  className="hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent flex w-full items-center gap-2 rounded-md px-1.5 py-1.5 text-left text-sm outline-none"
                >
                  <Icon className="text-muted-foreground size-4 shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{entry.name}</span>
                  {scope.hasVisibility && !entry.revealed && <HiddenBadge className="shrink-0" />}
                </button>
              )
            })
          )}
        </div>
      </FadingScroll>
    </FormatPopover>
  )
}
