import { useState } from "react"
import { Button } from "@/components/ui/button"
import { BentoTile } from "./BentoTile"
import { HomeCardBody } from "./HomeCardBody"
import { NewMapDialog } from "./NewMapDialog"

// The wide Map Maker tile, which opens the window to start a map.
export function MapMakerTile() {
  const [open, setOpen] = useState(false)

  return (
    <BentoTile className="md:col-span-2">
      <HomeCardBody title="Map Maker" line="Paint world and region maps." actions={<Button size="lg" onClick={() => setOpen(true)}>Open Map Maker</Button>} />
      <NewMapDialog open={open} onClose={() => setOpen(false)} />
    </BentoTile>
  )
}
