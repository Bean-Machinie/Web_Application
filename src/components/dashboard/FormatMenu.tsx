import type { CSSProperties } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FadingScroll } from "./FadingScroll"
import { menuUnder } from "./format-menu-switch"
import type { MenuControl } from "./format-menu-switch"

type Option = { label: string; active: boolean; onPick: () => void; style?: CSSProperties }

type Props = {
  label: string
  // What is set at the selection now.
  current: string
  options: Option[]
  control: MenuControl
  // The list gives the focus back to the text, not to its own field.
  onClosed: () => void
  // Takes the room left in its row, so a pair of fields fills the bar's width.
  fill?: boolean
  // The current choice shown in its own look, as a font is.
  currentStyle?: CSSProperties
}

// A choice from a short list, such as the font or its size. It is the map builder's
// category select: the same field, and a list that opens just under it at its width.
export function FormatMenu({ label, current, currentStyle, options, control, onClosed, fill }: Props) {
  const chosen = options.find((option) => option.active)?.label ?? ""
  return (
    <Select
      value={chosen}
      onValueChange={(next) => options.find((option) => option.label === next)?.onPick()}
      open={control.openId === control.id}
      onOpenChange={(open) => control.choose(open ? control.id : null, control.id)}
    >
      <SelectTrigger
        size="sm"
        aria-label={label}
        data-format-menu={control.id}
        className={`text-xs *:data-[slot=select-value]:w-full ${fill ? "flex-1" : "w-24"}`}
      >
        <SelectValue>
          <span className="truncate" style={currentStyle}>
            {current}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        position="popper"
        sideOffset={2}
        align="start"
        className="w-(--radix-select-trigger-width) min-w-0 overflow-hidden shadow-lg"
        onPointerDownOutside={(event) => {
          event.preventDefault()
          const under = menuUnder(event)
          control.choose(under === control.id ? null : under, control.id)
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          onClosed()
        }}
      >
        <FadingScroll maxHeight="min(16rem, var(--radix-select-content-available-height))">
          <div className="p-1">
            {options.map((option) => (
              <SelectItem key={option.label} value={option.label} style={option.style} className="rounded-md text-xs">
                {option.label}
              </SelectItem>
            ))}
          </div>
        </FadingScroll>
      </SelectContent>
    </Select>
  )
}
