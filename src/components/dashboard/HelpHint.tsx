import { CircleHelp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KeyChips } from "@/components/ui/key-chips"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export type HelpLine = {
  // What you can do.
  label: string
  // How: the keys to press, or a few words where it is not a key.
  keys?: string[]
  how?: string
}

type Props = { title: string; summary: string; lines: HelpLine[]; note?: string }

// The "?" beside a window's title. It says what the window is for and lists
// what you can do in it, with the keys as chips like the map builder's tooltips.
export function HelpHint({ title, summary, lines, note }: Props) {
  return (
    <Popover>
      <Tooltip>
        {/* Focus alone must not open the tooltip: a window gives its first button
            focus when it opens, and a popover hands it back when it closes. */}
        <TooltipTrigger asChild onFocus={(event) => event.preventDefault()}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground"
              aria-label={`How ${title} works`}
            >
              <CircleHelp />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>How this works</TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="w-80 gap-3 p-4">
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium">{title}</p>
          <p className="text-muted-foreground text-sm">{summary}</p>
        </div>
        <ul className="flex flex-col gap-2">
          {lines.map((line) => (
            <li key={line.label} className="flex items-center justify-between gap-4 text-sm">
              <span>{line.label}</span>
              {line.keys ? (
                <KeyChips keys={line.keys} />
              ) : (
                <span className="text-muted-foreground text-right text-xs">{line.how}</span>
              )}
            </li>
          ))}
        </ul>
        {note && <p className="text-muted-foreground border-t pt-3 text-xs">{note}</p>}
      </PopoverContent>
    </Popover>
  )
}
