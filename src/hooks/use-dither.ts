import { useEffect, useRef } from "react"
import type { MutableRefObject, RefObject } from "react"
import { DITHER } from "@/lib/dither-config"
import { createDitherRenderer } from "@/lib/dither-renderer"
import type { DitherScene } from "@/lib/dither-scene"

const FRAME_MS = 1000 / DITHER.fps
const INTRO_SECONDS = 1.8
const WIPE_SECONDS = 1.8
const RIPPLE_SECONDS = 1
// The waves drift at this many seconds of travel per second, along a unit vector scaled to
// keep the speed the single diagonal had before.
const DRIFT = Math.SQRT2

const smooth = (t: number) => t * t * (3 - 2 * t)

// Runs the dither in a canvas it makes inside the box it is given, and only while it can be seen:
// the loop stops when the tab is hidden or the box is off screen, and when still, or with
// reduced motion, one frame is drawn and that is all. It is capped at DITHER.fps. A new canvas for each run, and no
// loseContext on cleanup: React runs effects twice in development, and a canvas whose context
// was lost gives that same dead context back.
// When the scene changes, the new colour spreads out from the middle on a bright front while the
// drift swings round to its new direction. The ripple ref is given a function that starts a ripple at
// a point of the window; still and reduced-motion backgrounds have none.
export function useDither(boxRef: RefObject<HTMLElement | null>, still: boolean, scene: DitherScene, ripple: MutableRefObject<(x: number, y: number) => void>) {
  const target = useRef(scene)
  const retarget = useRef<() => void>(() => {})

  useEffect(() => {
    target.current = scene
    retarget.current()
  }, [scene])

  useEffect(() => {
    const box = boxRef.current
    if (!box) return
    const canvas = document.createElement("canvas")
    canvas.className = "block max-w-none"
    const renderer = createDitherRenderer(canvas)
    if (!renderer) return
    box.append(canvas)

    // A still background, and reduced motion, which forces it: one frame, drawn at full reveal.
    const reduced = still || window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const intro = DITHER.intro && !reduced
    const state = {
      offset: [0, 0] as [number, number],
      reveal: intro ? 0 : 1,
      wipe: 1,
      from: target.current.color,
      to: target.current.color,
      fromDirection: target.current.direction,
      toDirection: target.current.direction,
      ripple: [0, 0, 1] as [number, number, number],
    }
    let visible = false
    let frame = 0
    let last = 0
    let resizing = 0

    const direction = (): [number, number] => {
      const e = smooth(state.wipe)
      return [
        state.fromDirection[0] + (state.toDirection[0] - state.fromDirection[0]) * e,
        state.fromDirection[1] + (state.toDirection[1] - state.fromDirection[1]) * e,
      ]
    }
    const draw = () =>
      renderer.draw({
        offset: state.offset,
        intro: intro ? smooth(state.reveal) : 1,
        wipe: smooth(state.wipe),
        from: state.from,
        to: state.to,
        ripple: state.ripple,
      })
    // Still and reduced-motion backgrounds change at once; the others start the wipe from
    // wherever the drift is now.
    retarget.current = () => {
      const next = target.current
      if (next.color === state.to) return
      state.from = state.to
      state.fromDirection = direction()
      state.to = next.color
      state.toDirection = next.direction
      state.wipe = reduced ? 1 : 0
      if (reduced) state.from = state.to
      draw()
    }
    const size = () => {
      renderer.resize(Math.max(1, box.clientWidth), Math.max(1, box.clientHeight))
      draw()
    }
    const tick = (now: number) => {
      frame = requestAnimationFrame(tick)
      if (last && now - last < FRAME_MS - 1) return
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 1 / 60
      last = now
      const [dx, dy] = direction()
      state.offset[0] += dx * DRIFT * dt
      state.offset[1] += dy * DRIFT * dt
      if (state.reveal < 1) state.reveal = Math.min(1, state.reveal + dt / INTRO_SECONDS)
      if (state.wipe < 1) state.wipe = Math.min(1, state.wipe + dt / WIPE_SECONDS)
      if (state.ripple[2] < 1) state.ripple[2] = Math.min(1, state.ripple[2] + dt / RIPPLE_SECONDS)
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

    ripple.current = (x, y) => {
      if (!reduced) state.ripple = [x, y, 0]
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
      ripple.current = () => {}
      window.clearTimeout(resizing)
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersection.disconnect()
      document.removeEventListener("visibilitychange", update)
      renderer.destroy()
      canvas.remove()
    }
  }, [boxRef, still, ripple])
}
