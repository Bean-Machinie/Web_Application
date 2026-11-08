import { useEffect, useRef } from "react"
import { useCanvasLoop } from "@/hooks/use-canvas-loop"
import type { CanvasFrame } from "@/hooks/use-canvas-loop"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { COARSEST_BLOCK, drawPixelated } from "@/lib/pixelate"
import { cn } from "@/lib/utils"
import { useTileHot } from "./tile-hot"

const DURATION_MS = 700
const easeOut = (p: number) => 1 - Math.pow(1 - p, 3)

// A portrait in coarse grey blocks that, as its tile is pointed at, sharpen down to the full picture in
// colour, so the character comes to life; it goes back to blocks when the pointer leaves.
export function PixelatedPortrait({ src, className }: { src: string; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const buffer = useRef<HTMLCanvasElement | null>(null)
  const image = useRef<HTMLImageElement | null>(null)
  const hot = useTileHot()
  const reduced = useReducedMotion()
  const block = useRef(COARSEST_BLOCK)
  const change = useRef({ from: COARSEST_BLOCK, start: 0 })

  // Declared before the loop so the change is set up before the loop draws it.
  useEffect(() => {
    change.current = { from: block.current, start: performance.now() }
  }, [hot])

  const kick = useCanvasLoop(
    canvas,
    ({ ctx, width, height, now }: CanvasFrame) => {
      const picture = image.current
      if (!picture) return false
      const target = hot ? 1 : COARSEST_BLOCK
      const { from, start } = change.current
      const p = reduced ? 1 : Math.min(1, (now - start) / DURATION_MS)
      block.current = Math.exp(Math.log(from) + (Math.log(target) - Math.log(from)) * easeOut(p))
      buffer.current ??= document.createElement("canvas")
      drawPixelated(ctx, picture, width, height, Math.max(1, Math.round(block.current)), buffer.current)
      return p < 1
    },
    0
  )

  useEffect(() => kick.current(), [hot, kick])

  useEffect(() => {
    let current = true
    const load = (cors: boolean) => {
      const next = new Image()
      if (cors) next.crossOrigin = "anonymous"
      next.onload = () => {
        if (!current) return
        image.current = next
        kick.current()
      }
      // Without leave to read its pixels it still shows, only without the grain.
      if (cors) next.onerror = () => current && load(false)
      next.src = src
    }
    load(true)
    return () => {
      current = false
    }
  }, [src, kick])

  return (
    <canvas
      ref={canvas}
      aria-hidden
      className={cn(!reduced && "transition-[filter,opacity] duration-700", hot ? "opacity-100 grayscale-0" : "opacity-70 grayscale", className)}
    />
  )
}
