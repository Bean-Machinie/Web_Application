import { HoverIcon } from "@/components/icons/HoverIcon"
import { EllipsisIcon } from "@/components/icons/EllipsisIcon"
import { Button } from "@/components/ui/button"
import { MAP_FLOAT, MAP_FLOAT_BUTTON } from "./map-float"

// The same "…" that opens the details panel on every other entry, floating at
// the top right of a map that has no image yet. Once it has one, the navigator
// carries this button in its header (see MapViewerNavigator).
export function MapDetailsButton({ onClick }: { onClick: () => void }) {
  return (
    <div className={`${MAP_FLOAT} absolute top-4 right-4 z-[1000]`}>
      <Button variant="ghost" aria-label="Details" className={MAP_FLOAT_BUTTON} onClick={onClick}>
        <HoverIcon icon={EllipsisIcon} />
      </Button>
    </div>
  )
}
