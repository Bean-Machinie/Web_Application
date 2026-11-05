import type { Editor } from "@tiptap/react"
import { SquarePlus } from "lucide-react"
import { FadingScroll } from "./FadingScroll"
import { FormatPopover } from "./FormatPopover"
import type { MenuControl } from "./format-menu-switch"
import { SLASH_ITEMS } from "./slash-items"
import type { SlashItem } from "./slash-items"

type Props = { editor: Editor; control: MenuControl; onClosed: () => void }

// The blocks that / offers, from the format bar: headings, lists, quotes and the rest.
// They apply to the selected blocks, or the one the cursor is in.
export function FormatBlockMenu({ editor, control, onClosed }: Props) {
  const choose = (item: SlashItem) => {
    // The slash items clear what was typed after the slash; here nothing was, so the
    // range to clear is empty, and the text selected stays.
    const at = editor.state.selection.to
    control.choose(null, control.id)
    item.run(editor, { from: at, to: at })
  }

  return (
    <FormatPopover label="Blocks" icon={SquarePlus} control={control} onClosed={onClosed} keepTextFocus>
      <FadingScroll maxHeight="min(18rem, var(--radix-popover-content-available-height))">
        <div className="p-1">
          {SLASH_ITEMS.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => choose(item)}
              className="hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent flex w-full items-center gap-2.5 rounded-md px-1.5 py-1 text-left text-sm outline-none"
            >
              <item.icon className="text-muted-foreground size-4 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block truncate">{item.title}</span>
                <span className="text-muted-foreground block truncate text-xs">{item.hint}</span>
              </span>
            </button>
          ))}
        </div>
      </FadingScroll>
    </FormatPopover>
  )
}
