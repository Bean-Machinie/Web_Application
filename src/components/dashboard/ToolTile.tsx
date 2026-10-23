import type { LucideIcon } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Props = {
  name: string
  // Shown in the tooltip.
  description: string
  icon: LucideIcon
  // The tile itself; a plain surface when there is none.
  image: string | null
  onOpen: () => void
}

// A tool as a square picture, like a card in an app store: its icon and name at the
// bottom left, on a fade so they read over any picture. The whole tile is one button.
// On hover or focus the picture grows a little inside its frame and the frame takes a
// ring in the primary colour.
export function ToolTile({ name, description, icon: ToolIcon, image, onOpen }: Props) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onOpen}
          className="group/tile bg-muted focus-visible:border-primary focus-visible:ring-primary hover:border-primary hover:ring-primary relative block aspect-square w-[220px] max-w-full overflow-hidden rounded-lg border text-left outline-none transition-[border-color,box-shadow] duration-150 hover:ring-1 focus-visible:ring-1"
        >
          {image && (
            <img
              src={image}
              alt=""
              className="size-full object-cover transition-transform duration-150 group-hover/tile:scale-[1.03] group-focus-visible/tile:scale-[1.03]"
            />
          )}
          <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[35%] bg-gradient-to-t from-black/70 to-transparent" />
          <span className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-black/45 text-white">
              <ToolIcon className="size-3.5" />
            </span>
            <span className="text-sm font-medium text-white">{name}</span>
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent>{description}</TooltipContent>
    </Tooltip>
  )
}
