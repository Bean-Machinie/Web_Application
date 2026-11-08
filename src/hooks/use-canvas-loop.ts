import { useEffect, useRef } from "react"
import type { RefObject } from "react"

export type CanvasFrame = { ctx: CanvasRenderingContext2D; width: number; height: number; now: number }

// Draws a canvas at its CSS size (at most twice the pixels, to spare weak screens) and redraws it
// at the given rate, but only while it is on screen and the tab is shown. A rate of 0 draws once,
// for reduced motion or a still picture; changing the rate draws at once. A draw that returns true is
// in the middle of a change and is called again next frame, whatever the rate.
export function useCanvasLoop(ref: RefObject<HTMLCanvasElement | null>, draw: (frame: CanvasFrame) => boolean | void, fps: number) {
  const drawRef = useRef(draw)
  const fpsRef = useRef(fps)
  const kickRef = useRef<() => void>(() => {})

  useEffect(() => {
    drawRef.current = draw
  })

  useEffect(() => {
    fpsRef.current = fps
    kickRef.current()
  }, [fps])

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    let width = 0
    let height = 0
    let raf = 0
    let last = 0
    let onScreen = false
    let busy = false

    const paint = (now: number) => {
      if (width === 0 || height === 0) return
      ctx.clearRect(0, 0, width, height)
      busy = drawRef.current({ ctx, width, height, now }) === true
    }
    const tick = (now: number) => {
      raf = 0
      const rate = busy ? 60 : fpsRef.current
      if (rate <= 0 || !onScreen || document.hidden) return
      if (now - last >= 1000 / rate - 2) {
        last = now
        paint(now)
      }
      raf = requestAnimationFrame(tick)
    }
    const kick = () => {
      paint(performance.now())
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const box = canvas.getBoundingClientRect()
      width = box.width
      height = box.height
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      paint(performance.now())
    }

    kickRef.current = kick
    const sizeWatch = new ResizeObserver(resize)
    const seen = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      if (onScreen) kick()
    })
    const onVisibility = () => !document.hidden && kick()
    sizeWatch.observe(canvas)
    seen.observe(canvas)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      kickRef.current = () => {}
      cancelAnimationFrame(raf)
      sizeWatch.disconnect()
      seen.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [ref])

  return kickRef
}
