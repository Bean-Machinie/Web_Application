import { Check, MapPinPlus, Move, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { MAP_FLOAT_ROW } from "./map-float"

type Props = {
  placing: boolean
  // Whether markers are being moved, linked and removed.
  editing: boolean
  onPlace: () => void
  onCancel: () => void
  onToggleEditing: () => void
}

const FLOAT = `${MAP_FLOAT_ROW} absolute bottom-4 left-1/2 z-[1000] -translate-x-1/2`

// The GM's marker tools, a compact toolbar floating at the bottom of the map:
// add a marker, or switch to editing the ones there.
export function MapEditBar({ placing, editing, onPlace, onCancel, onToggleEditing }: Props) {
  if (placing) {
    return (
      <div className={`${FLOAT} flex items-center gap-1 pr-1 pl-4 text-sm`}>
        Click the map to place the marker
        <Button variant="ghost" size="icon-sm" aria-label="Cancel" onClick={onCancel}>
          <X />
        </Button>
      </div>
    )
  }

  return (
    <div className={`${FLOAT} flex items-center gap-1 px-1`}>
      <Button variant="ghost" size="sm" onClick={onPlace}>
        <MapPinPlus />
        Add marker
      </Button>
      <Separator orientation="vertical" className="data-[orientation=vertical]:h-5" />
      <Button
        variant={editing ? "default" : "ghost"}
        size="sm"
        aria-pressed={editing}
        onClick={onToggleEditing}
      >
        {editing ? <Check /> : <Move />}
        {editing ? "Editing markers" : "Edit markers"}
      </Button>
    </div>
  )
}
