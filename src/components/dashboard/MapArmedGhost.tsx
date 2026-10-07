import { useEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import { assetById, defaultWidth, loadAssetInfo } from "@/lib/map-assets"
import type { AssetInfo } from "@/lib/map-assets"

type Props = {
  asset: string
  // How many screen pixels one canvas pixel is right now.
  viewScale: number
  // The canvas area, which the ghost follows the pointer over.
  area: RefObject<HTMLElement | null>
}

// The picked art, following the pointer over the canvas at the size and place a
// stamp would have, held by the middle of what is painted. It moves by its style,
// not by state, so following the pointer redraws nothing else.
export function MapArmedGhost({ asset, viewScale, area }: Props) {
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
    const factor = (defaultWidth(category) * viewScale) / trim.width
    ghost.style.width = `${image.naturalWidth * factor}px`
    ghost.style.height = `${image.naturalHeight * factor}px`
    const middle = { x: (trim.x + trim.width / 2) * factor, y: (trim.y + trim.height / 2) * factor }

    const move = (event: PointerEvent) => {
      const box = element.getBoundingClientRect()
      ghost.style.transform = `translate(${event.clientX - box.left - middle.x}px, ${event.clientY - box.top - middle.y}px)`
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
  }, [info, category, viewScale, area])

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
