import { Maximize, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MAP_FLOAT, MAP_FLOAT_BUTTON } from "./map-float"

type Props = { onZoom: (factor: number) => void; onFit: () => void }

// The same stack of zoom buttons as on a map, over the canvas.
export function MapBuilderZoom({ onZoom, onFit }: Props) {
  return (
    <div
      className={`${MAP_FLOAT} absolute right-4 bottom-4 z-10 flex flex-col divide-y overflow-hidden`}
    >
      <Button
        variant="ghost"
        aria-label="Zoom in"
        className={MAP_FLOAT_BUTTON}
        onClick={() => onZoom(1.4)}
      >
        <Plus />
      </Button>
      <Button
        variant="ghost"
        aria-label="Zoom out"
        className={MAP_FLOAT_BUTTON}
        onClick={() => onZoom(1 / 1.4)}
      >
        <Minus />
      </Button>
      <Button
        variant="ghost"
        aria-label="Fit canvas to view"
        className={MAP_FLOAT_BUTTON}
        onClick={onFit}
      >
        <Maximize />
      </Button>
    </div>
  )
}
