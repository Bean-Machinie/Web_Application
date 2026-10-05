import { defaultWidth } from "@/lib/map-assets"
import type { MapAsset } from "@/lib/map-assets"

type Props = {
  asset: MapAsset
  // How many screen pixels one canvas pixel is right now.
  viewScale: number
  onPlace: (id: string) => void
}

// One piece of art in the library: click to place it in the middle of the view,
// or drag it onto the canvas. What follows the pointer while dragging is the art
// itself, at the size it will have where it lands at the current zoom.
export function MapAssetTile({ asset, viewScale, onPlace }: Props) {
  function startDrag(event: React.DragEvent<HTMLButtonElement>) {
    event.dataTransfer.setData("application/x-map-asset", asset.id)
    event.dataTransfer.effectAllowed = "copy"
    const picture = event.currentTarget.querySelector("img")
    if (!picture?.naturalWidth) return
    const width = defaultWidth(asset.category) * viewScale
    const height = (width * picture.naturalHeight) / picture.naturalWidth
    const ghost = picture.cloneNode() as HTMLImageElement
    Object.assign(ghost.style, {
      position: "fixed",
      top: "-10000px",
      left: "0",
      width: `${width}px`,
      height: `${height}px`,
      maxWidth: "none",
      pointerEvents: "none",
    })
    document.body.appendChild(ghost)
    // Centred on the pointer, as the art is when it is dropped.
    event.dataTransfer.setDragImage(ghost, width / 2, height / 2)
    setTimeout(() => ghost.remove(), 0)
  }

  return (
    <button
      type="button"
      draggable
      title={asset.name}
      onClick={() => onPlace(asset.id)}
      onDragStart={startDrag}
      className="group/tile bg-card hover:border-foreground/25 focus-visible:ring-ring flex flex-col overflow-hidden rounded-lg border text-left outline-none transition-colors focus-visible:ring-2"
    >
      <span className="bg-muted/60 flex aspect-square items-center justify-center p-2">
        <img
          src={asset.url}
          alt=""
          draggable={false}
          className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover/tile:scale-105"
        />
      </span>
      <span className="truncate px-2 py-1.5 text-xs font-medium">{asset.name}</span>
    </button>
  )
}
