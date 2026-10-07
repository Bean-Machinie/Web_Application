import { useEffect, useRef, useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAssetThumb } from "@/hooks/use-asset-thumb"
import { defaultWidth, loadAssetInfo, loadedAssetInfo } from "@/lib/map-assets"
import type { MapAsset } from "@/lib/map-assets"
import { cn } from "@/lib/utils"

type Props = {
  asset: MapAsset
  // Picked to be stamped on the map.
  armed: boolean
  // How many screen pixels one canvas pixel is right now.
  viewScale: number
  onArm: (id: string) => void
}

// One piece of art in the library, as a small picture: click it to pick it up and
// stamp it on the map, or drag it onto the canvas. Its name shows on hover. The
// picture is a thumbnail made when the tile first comes into view; the full-size
// art is only loaded when the pointer reaches the tile. What follows the pointer
// when dragging is the art itself, at the size it will have where it lands at
// the current zoom, held by the middle of what is painted.
export function MapAssetTile({ asset, armed, viewScale, onArm }: Props) {
  const tile = useRef<HTMLButtonElement>(null)
  const [seen, setSeen] = useState(false)
  const thumb = useAssetThumb(asset.id, seen)
  // The name floats over the page, and when the list scrolls it would take the
  // time of its fade out to close, riding up with its tile over the panel above.
  // So it is hidden at the first scroll, before anything is painted.
  const [named, setNamed] = useState(false)
  const nameBox = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!named) return
    const putAway = () => {
      nameBox.current
        ?.closest<HTMLElement>("[data-radix-popper-content-wrapper]")
        ?.style.setProperty("visibility", "hidden")
      setNamed(false)
    }
    // Scrolling does not bubble, so it is heard on the way down.
    window.addEventListener("scroll", putAway, { capture: true, passive: true })
    return () => window.removeEventListener("scroll", putAway, { capture: true })
  }, [named])

  useEffect(() => {
    const element = tile.current
    if (!element || seen) return
    const watch = new IntersectionObserver(([entry]) => entry.isIntersecting && setSeen(true), {
      rootMargin: "200px",
    })
    watch.observe(element)
    return () => watch.disconnect()
  }, [seen])

  function startDrag(event: React.DragEvent<HTMLButtonElement>) {
    event.dataTransfer.setData("application/x-map-asset", asset.id)
    event.dataTransfer.effectAllowed = "copy"
    // Measured on arrival of the pointer, so it is nearly always there by now;
    // without it the drag shows the tile.
    const info = loadedAssetInfo(asset.id)
    if (!info) return
    const { trim, image } = info
    // Pixels on screen for each pixel of the picture.
    const factor = (defaultWidth(asset.category) * viewScale) / trim.width
    const ghost = image.cloneNode() as HTMLImageElement
    Object.assign(ghost.style, {
      position: "fixed",
      top: "-10000px",
      left: "0",
      width: `${image.naturalWidth * factor}px`,
      height: `${image.naturalHeight * factor}px`,
      maxWidth: "none",
      pointerEvents: "none",
    })
    document.body.appendChild(ghost)
    event.dataTransfer.setDragImage(
      ghost,
      (trim.x + trim.width / 2) * factor,
      (trim.y + trim.height / 2) * factor
    )
    setTimeout(() => ghost.remove(), 0)
  }

  return (
    <Tooltip open={named} onOpenChange={setNamed}>
      <TooltipTrigger asChild>
        <button
          ref={tile}
          type="button"
          draggable
          aria-label={asset.name}
          aria-pressed={armed}
          onPointerEnter={() => void loadAssetInfo(asset.id)}
          onFocus={() => void loadAssetInfo(asset.id)}
          onClick={() => onArm(asset.id)}
          onDragStart={startDrag}
          className={cn(
            "group/tile bg-muted/60 hover:border-foreground/25 focus-visible:ring-ring flex aspect-square items-center justify-center overflow-hidden rounded-md border p-1.5 outline-none transition-colors focus-visible:ring-2",
            armed && "border-ring bg-secondary ring-ring ring-2"
          )}
        >
          {thumb && (
            <img
              src={thumb}
              alt=""
              draggable={false}
              className="max-h-full max-w-full object-contain transition-transform duration-200 group-hover/tile:scale-105"
            />
          )}
        </button>
      </TooltipTrigger>
      {/* Below the tile, so that the name of one in the top row is never over the search
          and categories above the tiles. It closes by itself when the list scrolls. */}
      <TooltipContent ref={nameBox} side="bottom" sideOffset={4}>
        {asset.name}
      </TooltipContent>
    </Tooltip>
  )
}
