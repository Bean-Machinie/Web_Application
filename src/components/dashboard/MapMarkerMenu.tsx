import { Link2, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Props = {
  // Where the marker's tip is inside the map.
  point: { x: number; y: number }
  onChangeLink: () => void
  onRemove: () => void
  onClose: () => void
}

// Above the pin's head.
const RISE = 56

// What a GM can do to a marker while editing, opening over the pin. It is not
// modal, so the map stays usable and a click elsewhere just closes it.
export function MapMarkerMenu({ point, onChangeLink, onRemove, onClose }: Props) {
  return (
    <DropdownMenu open modal={false} onOpenChange={(open) => !open && onClose()}>
      <DropdownMenuTrigger asChild>
        <span
          aria-hidden
          className="pointer-events-none absolute z-[1000] size-0"
          style={{ left: point.x, top: point.y - RISE }}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side="top"
        align="center"
        sideOffset={8}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DropdownMenuItem onSelect={onChangeLink}>
          <Link2 />
          Change link
        </DropdownMenuItem>
        <DropdownMenuItem variant="destructive" onSelect={onRemove}>
          <Trash2 />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
