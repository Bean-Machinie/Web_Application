import { useState } from "react"
import type * as L from "leaflet"
import { Map as MapIcon, MoreHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { MapSize } from "@/lib/map-geometry"
import { MapViewerNavigatorBody } from "./MapViewerNavigatorBody"
import { MAP_FLOAT } from "./map-float"

type Props = { map: L.Map | null; url: string; size: MapSize; onDetails: () => void }

// On a phone the navigator is not over the map: two large buttons are, at the top
// right, one to open it from the bottom and one for the details.
export function MapViewerPhoneControls({ map, url, size, onDetails }: Props) {
  const [open, setOpen] = useState(false)
  if (!map) return null

  return (
    <>
      <div className={`${MAP_FLOAT} absolute top-3 right-3 z-[1000] flex overflow-hidden`}>
        <Button variant="ghost" aria-label="Open the navigator" className="size-11 rounded-none" onClick={() => setOpen(true)}>
          <MapIcon />
        </Button>
        <Button variant="ghost" aria-label="Details" className="size-11 rounded-none border-l" onClick={onDetails}>
          <MoreHorizontal />
        </Button>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="bottom" showCloseButton={false} className="max-h-[85dvh] gap-0 rounded-t-xl p-0">
          <SheetHeader className="flex h-12 flex-row items-center justify-between border-b py-0 pr-1 pl-4">
            <SheetTitle className="text-sm font-semibold">Navigator</SheetTitle>
            <SheetDescription className="sr-only">Where you are on the map, and the zoom</SheetDescription>
            <SheetClose asChild>
              <Button variant="ghost" aria-label="Close" className="size-11">
                <X />
              </Button>
            </SheetClose>
          </SheetHeader>
          <MapViewerNavigatorBody map={map} url={url} size={size} />
        </SheetContent>
      </Sheet>
    </>
  )
}
