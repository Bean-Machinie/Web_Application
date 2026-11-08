import { useEffect, useRef } from "react"
import { useCanvasLoop } from "@/hooks/use-canvas-loop"
import type { CanvasFrame } from "@/hooks/use-canvas-loop"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { colours, flyTo, newSwarm, sampleImage, step } from "@/lib/image-particles"
import type { Swarm } from "@/lib/image-particles"
import { drawPixelated } from "@/lib/pixelate"
import { useTileHot } from "./tile-hot"

// Loads a picture whose pixels may be read; one from a site that does not allow that still loads, to be
// shown as it is.
function loadImage(src: string, cors = true): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    if (cors) image.crossOrigin = "anonymous"
    image.onload = () => resolve(image)
    image.onerror = () => (cors ? loadImage(src, false).then(resolve, reject) : reject())
    image.src = src
  })
}

// A picture as about 1,500 small squares in its colours. While the tile is hot the squares near the
// pointer are pushed away and spring back; a new picture makes them fly from the old one to it.
export function ImageParticles({ src, className }: { src: string; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const hot = useTileHot()
  const reduced = useReducedMotion()
  const swarm = useRef<Swarm | null>(null)
  // The picture shown, the one waiting to be flown to, and the box the swarm was sampled for.
  const shown = useRef<HTMLImageElement | null>(null)
  const pending = useRef<HTMLImageElement | null>(null)
  const box = useRef("")
  const pointer = useRef<{ x: number; y: number } | null>(null)
  const buffer = useRef<HTMLCanvasElement | null>(null)

  const kick = useCanvasLoop(
    canvas,
    ({ ctx, width, height, now }: CanvasFrame) => {
      const size = `${width}x${height}`
      if (box.current !== size && shown.current) {
        const sample = sampleImage(shown.current, width, height)
        swarm.current = sample && newSwarm(sample)
      }
      box.current = size
      if (pending.current) {
        const sample = sampleImage(pending.current, width, height)
        if (sample && swarm.current) flyTo(swarm.current, sample, now, reduced)
        else swarm.current = sample && newSwarm(sample)
        shown.current = pending.current
        pending.current = null
      }
      const s = swarm.current
      if (!s) {
        buffer.current ??= document.createElement("canvas")
        if (shown.current) drawPixelated(ctx, shown.current, width, height, 1, buffer.current)
        return false
      }
      const moving = step(s, now, hot ? pointer.current : null, reduced)
      const rgb = colours(s, now)
      const half = s.to.size / 2
      for (let i = 0; i < s.x.length; i++) {
        ctx.fillStyle = `rgb(${rgb[i * 3]},${rgb[i * 3 + 1]},${rgb[i * 3 + 2]})`
        ctx.fillRect(s.x[i] - half, s.y[i] - half, s.to.size, s.to.size)
      }
      return moving
    },
    hot && !reduced ? 60 : 0
  )

  useEffect(() => {
    let current = true
    loadImage(src).then(
      (image) => {
        if (!current) return
        pending.current = image
        kick.current()
      },
      () => {}
    )
    return () => {
      current = false
    }
  }, [src, kick])

  // The art sits under the text and takes no pointer, so the pointer is followed on the window.
  useEffect(() => {
    if (!hot) {
      pointer.current = null
      return
    }
    const onMove = (event: PointerEvent) => {
      const rect = canvas.current?.getBoundingClientRect()
      if (rect) pointer.current = { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }
    window.addEventListener("pointermove", onMove)
    return () => window.removeEventListener("pointermove", onMove)
  }, [hot])

  return <canvas ref={canvas} aria-hidden className={className} />
}
