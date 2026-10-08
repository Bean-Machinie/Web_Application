import { Check, MapPinPlus, Move, Upload, X } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import type { MapImageUpload } from "@/hooks/use-map-image-upload"
import { cn } from "@/lib/utils"
import { MapImageInput } from "./MapImageInput"

type Props = {
  placing: boolean
  // Whether markers are being moved, linked and removed.
  editing: boolean
  upload: MapImageUpload
  onPlace: () => void
  onCancel: () => void
  onToggleEditing: () => void
}

// The GM's tools, top left of the map: add a marker, switch to editing the
// ones there, or replace the image.
export function MapEditBar({ placing, editing, upload, onPlace, onCancel, onToggleEditing }: Props) {
  if (placing) {
    return (
      <div className="bg-background/90 absolute top-3 left-3 z-[1000] flex items-center gap-1 rounded-lg border py-1 pr-1 pl-3 text-sm shadow-sm backdrop-blur-sm">
        Click the map to place the marker
        <Button variant="ghost" size="icon-sm" aria-label="Cancel" onClick={onCancel}>
          <X />
        </Button>
      </div>
    )
  }

  return (
    <div className="absolute top-3 left-3 z-[1000] flex gap-2">
      <Button size="sm" className="shadow-sm" onClick={onPlace}>
        <MapPinPlus />
        Add marker
      </Button>
      <Button
        variant={editing ? "default" : "outline"}
        size="sm"
        aria-pressed={editing}
        className={cn("shadow-sm", !editing && "bg-background/90 backdrop-blur-sm")}
        onClick={onToggleEditing}
      >
        {editing ? <Check /> : <Move />}
        {editing ? "Editing markers" : "Edit markers"}
      </Button>
      <MapImageInput
        busy={upload.busy}
        onPick={upload.pick}
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "bg-background/90 shadow-sm backdrop-blur-sm"
        )}
      >
        <Upload />
        {upload.busy ? "Uploading…" : "Replace map"}
      </MapImageInput>
    </div>
  )
}
