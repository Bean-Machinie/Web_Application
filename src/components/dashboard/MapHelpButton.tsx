import { CircleHelp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KeyChips } from "@/components/ui/key-chips"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useShortcutKeys } from "@/hooks/use-shortcut-keys"
import type { HelpRow } from "@/lib/map-help"

type Props = { title: string; rows: HelpRow[] }

function Row({ row }: { row: HelpRow }) {
  const keysOf = useShortcutKeys()
  const keys = row.action ? keysOf(row.action) : (row.keys ?? [])
  return (
    <li className="flex items-start justify-between gap-3">
      <span className="min-w-0">{row.label}</span>
      <span className="text-muted-foreground flex shrink-0 items-center justify-end gap-1.5">
        {keys.length > 0 && <KeyChips keys={keys} />}
        {row.gesture && <span className="text-xs">{row.gesture}</span>}
      </span>
    </li>
  )
}

// A small question mark at the end of a panel's header: a click, or a tap, opens a card of what can be
// done there, a row each, with the keys as chips. It is where the long hints of a panel
// are kept, so the panel is left to its controls.
export function MapHelpButton({ title, rows }: Props) {
  if (rows.length === 0) return null
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon-xs" aria-label={title} className="text-muted-foreground my-auto mr-1.5">
              <CircleHelp />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Help</TooltipContent>
      </Tooltip>
      <PopoverContent side="bottom" align="end" className="w-60 gap-2 p-3">
        <h3 className="text-sm font-medium">{title}</h3>
        <ul className="grid gap-1.5 text-xs">
          {rows.map((row, index) => (
            <Row key={`${row.label}-${index}`} row={row} />
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
