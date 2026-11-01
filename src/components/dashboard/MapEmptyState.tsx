import { useState } from "react"
import { FormAlert } from "@/components/auth/FormAlert"
import { HammerIcon } from "@/components/icons/HammerIcon"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { ImagePlusIcon } from "@/components/icons/ImagePlusIcon"
import { Button, buttonVariants } from "@/components/ui/button"
import type { MapImageUpload } from "@/hooks/use-map-image-upload"
import { MapImageInput } from "./MapImageInput"
import { NewMapDialog } from "./NewMapDialog"

// A map with nothing in it yet: build it here, or bring an image.
export function MapEmptyState({ mapId, upload }: { mapId: string; upload: MapImageUpload }) {
  const [building, setBuilding] = useState(false)

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <div>
        <h3 className="text-sm font-medium">This map is empty</h3>
        <p className="text-muted-foreground mt-0.5 text-sm">Build it here, or start from an image.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button onClick={() => setBuilding(true)}>
          <HoverIcon icon={HammerIcon} />
          Open map builder
        </Button>
        <MapImageInput busy={upload.busy} onPick={upload.pick} className={buttonVariants({ variant: "outline" })}>
          <HoverIcon icon={ImagePlusIcon} />
          {upload.busy ? "Uploading…" : "Upload an image"}
        </MapImageInput>
      </div>
      {upload.error && <FormAlert tone="error">{upload.error}</FormAlert>}
      <NewMapDialog open={building} onClose={() => setBuilding(false)} mapId={mapId} />
    </div>
  )
}
