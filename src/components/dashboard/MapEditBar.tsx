import { Check, MapPinPlus, Move, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

type Props = {
  placing: boolean
  // Whether markers are being moved, linked and removed.
  editing: boolean
  onPlace: () => void
  onCancel: () => void
  onToggleEditing: () => void
}

// The GM's marker tools, for the middle of the status bar under the map: add a
// marker, or switch to editing the ones there.
export function MapEditBar({ placing, editing, onPlace, onCancel, onToggleEditing }: Props) {
  if (placing) {
    return (
      <>
        <span className="text-xs">Click the map to place the marker</span>
        <Button variant="ghost" size="icon-xs" className="pointer-coarse:size-11" aria-label="Cancel" onClick={onCancel}>
          <X />
        </Button>
      </>
    )
  }

  return (
    <>
      <Button variant="ghost" size="xs" className="pointer-coarse:h-11" onClick={onPlace}>
        <MapPinPlus />
        Add marker
      </Button>
      <Separator orientation="vertical" className="data-[orientation=vertical]:h-4" />
      <Button
        variant={editing ? "default" : "ghost"}
        size="xs"
        className="pointer-coarse:h-11"
        aria-pressed={editing}
        onClick={onToggleEditing}
      >
        {editing ? <Check /> : <Move />}
        {editing ? "Editing markers" : "Edit markers"}
      </Button>
    </>
  )
}
