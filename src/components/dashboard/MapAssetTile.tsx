import type { MapAsset } from "@/lib/map-assets"

type Props = { asset: MapAsset; onPlace: (id: string) => void }

// One piece of art in the library: click to place it in the middle of the view,
// or drag it onto the canvas.
export function MapAssetTile({ asset, onPlace }: Props) {
  return (
    <button
      type="button"
      draggable
      title={asset.name}
      onClick={() => onPlace(asset.id)}
      onDragStart={(event) => {
        event.dataTransfer.setData("application/x-map-asset", asset.id)
        event.dataTransfer.effectAllowed = "copy"
      }}
      className="group/tile bg-card hover:border-foreground/25 focus-visible:ring-ring flex flex-col overflow-hidden rounded-lg border text-left outline-none transition-colors focus-visible:ring-2"
    >
      <span className="bg-muted/60 flex aspect-square items-center justify-center p-2">
        <img
          src={asset.url}
          alt=""
          loading="lazy"
          draggable={false}
          className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover/tile:scale-105"
        />
      </span>
      <span className="truncate px-2 py-1.5 text-xs font-medium">{asset.name}</span>
    </button>
  )
}
