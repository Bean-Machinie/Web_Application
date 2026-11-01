import { useEffect } from "react"
import type { RefObject } from "react"
import { DITHER } from "@/lib/dither-config"
import { createDitherRenderer } from "@/lib/dither-renderer"

const FRAME_MS = 1000 / DITHER.fps
const INTRO_SECONDS = 1.8

// Runs the dither in a canvas it makes inside the box it is given, and only while it can be seen:
// the loop stops when the tab is hidden or the box is off screen, and with reduced motion one
// frame is drawn and that is all. It is capped at DITHER.fps. A new canvas for each run, and no
// loseContext on cleanup: React runs effects twice in development, and a canvas whose context
// was lost gives that same dead context back.
export function useDither(boxRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const canvas = document.createElement("canvas")
    canvas.className = "block h-full w-full"
    const renderer = createDitherRenderer(canvas)
    if (!renderer) return
    box.append(canvas)

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const intro = DITHER.intro && !reduced
    const state = { time: 0, reveal: intro ? 0 : 1 }
    let visible = false
    let frame = 0
    let last = 0
    let resizing = 0

    const draw = () => renderer.draw(state.time, intro ? state.reveal * state.reveal * (3 - 2 * state.reveal) : 1)
    const size = () => {
      renderer.resize(Math.max(1, box.clientWidth), Math.max(1, box.clientHeight))
      draw()
    }
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      if (last && now - last < FRAME_MS - 1) return
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60
      last = now
      state.time += dt
      if (state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS)
      draw()
    }
    const update = () => {
      const run = visible && !document.hidden && !reduced
      if (run && !frame) {
        last = 0
        frame = requestAnimationFrame(tick)
      }
      if (!run && frame) {
        cancelAnimationFrame(frame)
        frame = 0
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      window.clearTimeout(resizing)
      resizing = window.setTimeout(size, DITHER.resizeDebounceMs)
    })
    const intersection = new IntersectionObserver((entries) => {
      visible = entries.some((entry) => entry.isIntersecting)
      update()
    })
    size()
    resizeObserver.observe(box)
    intersection.observe(box)
    document.addEventListener("visibilitychange", update)

    return () => {
      window.clearTimeout(resizing)
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersection.disconnect()
      document.removeEventListener("visibilitychange", update)
      renderer.destroy()
      canvas.remove()
    }
  }, [boxRef])
}
