import { useEffect, useRef, useState } from "react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useAssetThumb } from "@/hooks/use-asset-thumb"
import { loadAssetInfo, loadedAssetInfo, placedWidth } from "@/lib/map-assets"
import type { MapAsset } from "@/lib/map-assets"
import { cn } from "@/lib/utils"

// The longest side of the picture dragged, in screen pixels, past which it is drawn smaller.
const MAX_DRAG_SIDE = 800

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
// the current zoom, held by the middle of what is painted (the tile's picture, for a
// drag so quick that the art has not been measured yet).
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
    const info = loadedAssetInfo(asset.id)
    if (!info) {
      // Not measured yet (a very quick drag): the tile's own picture is what is
      // dragged, rather than the browser's stand-in icon, and the art is got ready.
      void loadAssetInfo(asset.id)
      const picture = tile.current?.querySelector("img")
      if (picture) event.dataTransfer.setDragImage(picture, picture.width / 2, picture.height / 2)
      return
    }
    // What is painted, drawn on a canvas at the size it will have where it lands at the
    // current zoom, held by its middle. A canvas is drawn at once, so it is there when the
    // browser takes the picture; a copy of the image is not always ready by then, and the
    // browser then drags its own icon. Very large ones are drawn smaller.
    const { trim, image } = info
    const across = placedWidth(asset.id, trim) * viewScale
    const longest = Math.max(across, (across * trim.height) / trim.width)
    const factor = (across / trim.width) * Math.min(1, MAX_DRAG_SIDE / longest)
    const width = Math.max(1, Math.round(trim.width * factor))
    const height = Math.max(1, Math.round(trim.height * factor))
    const ratio = window.devicePixelRatio || 1
    const ghost = document.createElement("canvas")
    ghost.width = Math.round(width * ratio)
    ghost.height = Math.round(height * ratio)
    Object.assign(ghost.style, { position: "fixed", top: "-10000px", left: "0", width: `${width}px`, height: `${height}px`, pointerEvents: "none" })
    ghost.getContext("2d")?.drawImage(image, trim.x, trim.y, trim.width, trim.height, 0, 0, ghost.width, ghost.height)
    document.body.appendChild(ghost)
    event.dataTransfer.setDragImage(ghost, width / 2, height / 2)
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
          onPointerDown={() => void loadAssetInfo(asset.id)}
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
