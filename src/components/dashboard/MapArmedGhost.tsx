import { useEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import { assetById, loadAssetInfo, placedWidth } from "@/lib/map-assets"
import type { AssetInfo } from "@/lib/map-assets"
import type { BuilderView } from "@/lib/view-matrix"

type Props = {
  asset: string
  // The view: its scale is how many screen pixels one canvas pixel is right now.
  view: BuilderView
  // The canvas area, which the ghost follows the pointer over.
  area: RefObject<HTMLElement | null>
}

// The picked art, following the pointer over the canvas at the size and place a
// stamp would have, held by the middle of what is painted. It moves by its style,
// not by state, so following the pointer redraws nothing else.
export function MapArmedGhost({ asset, view, area }: Props) {
  const { scale: viewScale, rotation, flipH, flipV } = view
  const picture = useRef<HTMLImageElement>(null)
  const [info, setInfo] = useState<AssetInfo | null>(null)
  const category = assetById(asset)?.category

  useEffect(() => {
    let current = true
    void loadAssetInfo(asset).then((loaded) => current && setInfo(loaded))
    return () => {
      current = false
    }
  }, [asset])

  useEffect(() => {
    const element = area.current
    const ghost = picture.current
    if (!element || !ghost || !info || !category) return
    const { trim, image } = info
    const factor = (placedWidth(asset, trim) * viewScale) / trim.width
    ghost.style.width = `${image.naturalWidth * factor}px`
    ghost.style.height = `${image.naturalHeight * factor}px`
    const middle = { x: (trim.x + trim.width / 2) * factor, y: (trim.y + trim.height / 2) * factor }
    // Shown turned and mirrored as the view is, as the stamp will be.
    ghost.style.transformOrigin = "0 0"
    const turn = `rotate(${rotation}deg) scale(${flipH ? -1 : 1}, ${flipV ? -1 : 1}) translate(${-middle.x}px, ${-middle.y}px)`

    const move = (event: PointerEvent) => {
      const box = element.getBoundingClientRect()
      ghost.style.transform = `translate(${event.clientX - box.left}px, ${event.clientY - box.top}px) ${turn}`
      ghost.style.visibility = "visible"
    }
    const hide = () => {
      ghost.style.visibility = "hidden"
    }
    element.addEventListener("pointermove", move)
    element.addEventListener("pointerleave", hide)
    return () => {
      element.removeEventListener("pointermove", move)
      element.removeEventListener("pointerleave", hide)
    }
  }, [info, category, viewScale, rotation, flipH, flipV, area])

  const url = assetById(asset)?.url
  if (!url) return null
  return (
    <img
      ref={picture}
      src={url}
      alt=""
      draggable={false}
      className="pointer-events-none absolute top-0 left-0 z-10 max-w-none opacity-70"
      style={{ visibility: "hidden" }}
    />
  )
}
