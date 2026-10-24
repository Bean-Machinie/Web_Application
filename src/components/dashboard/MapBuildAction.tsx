import { useState } from "react"
import { HammerIcon } from "@/components/icons/HammerIcon"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { Button } from "@/components/ui/button"
import { MapBuilderLink } from "./MapBuilderLink"
import { NewMapDialog } from "./NewMapDialog"

// For a map with no image: open it in the builder if it was built there, or offer to
// build it instead of uploading, after choosing the canvas.
export function MapBuildAction({ mapId, built }: { mapId: string; built: boolean }) {
  const [open, setOpen] = useState(false)

  if (built) return <MapBuilderLink mapId={mapId} />

  return (
    <>
      <Button variant="outline" className="w-fit" onClick={() => setOpen(true)}>
        <HoverIcon icon={HammerIcon} />
        Build instead
      </Button>
      <NewMapDialog open={open} onClose={() => setOpen(false)} mapId={mapId} />
    </>
  )
}
