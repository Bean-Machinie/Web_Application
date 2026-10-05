import { BringToFront, Copy, FlipHorizontal2, FlipVertical2, SendToBack, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import type { AssetEditing } from "@/hooks/use-asset-editing"
import { MAP_FLOAT_ROW } from "./map-float"

type Props = { editing: AssetEditing }

// The floating bar for what is chosen: flip, duplicate, order and delete.
export function MapSelectionBar({ editing }: Props) {
  const count = editing.selected.length
  if (count === 0) return null

  const action = (label: string, shortcut: string, Icon: typeof Copy, run: () => void) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={label} onClick={run}>
          <Icon />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {label} <span className="opacity-70">{shortcut}</span>
      </TooltipContent>
    </Tooltip>
  )

  return (
    <div
      className={`${MAP_FLOAT_ROW} absolute top-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-0.5 px-1.5`}
    >
      <span className="text-muted-foreground px-2 text-xs whitespace-nowrap">
        {count === 1 ? "1 selected" : `${count} selected`}
      </span>
      <Separator orientation="vertical" className="mx-1 h-5" />
      {action("Flip horizontally", "Shift+H", FlipHorizontal2, () => editing.flip("x"))}
      {action("Flip vertically", "Shift+V", FlipVertical2, () => editing.flip("y"))}
      <Separator orientation="vertical" className="mx-1 h-5" />
      {action("Bring forward", "]", BringToFront, () => editing.reorder("forward"))}
      {action("Send back", "[", SendToBack, () => editing.reorder("back"))}
      <Separator orientation="vertical" className="mx-1 h-5" />
      {action("Duplicate", "Ctrl+D", Copy, editing.duplicate)}
      {action("Delete", "Del", Trash2, editing.remove)}
    </div>
  )
}
