import { Image as ImageIcon } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { TILE_SIZE } from "@/hooks/use-asset-tile-size"

type Props = { size: number; onSize: (size: number) => void }

// The slider for how big the library's tiles are, at the end of its header.
export function MapTileSize({ size, onSize }: Props) {
  return (
    <div className="flex items-center gap-2 pr-3">
      <ImageIcon className="text-muted-foreground size-3.5 shrink-0" aria-hidden />
      <Slider
        aria-label="Thumbnail size"
        className="w-20"
        min={TILE_SIZE.min}
        max={TILE_SIZE.max}
        step={4}
        value={[size]}
        onValueChange={([next]) => onSize(next)}
      />
    </div>
  )
}
