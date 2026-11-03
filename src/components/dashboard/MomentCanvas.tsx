import { useEffect, useRef } from "react"
import type { RefObject } from "react"
import { createPortal } from "react-dom"
import type { Effect } from "@/lib/roll-effect"

type Props = {
  // The number the effect starts from.
  target: RefObject<HTMLElement | null>
  make: (rect: DOMRect, el: HTMLElement) => Effect
  onDone: () => void
}

// A canvas over the whole window, at the screen's pixel density, that exists only while its effect runs.
// It is drawn into the page body: inside the result a transformed parent would move it.
export function MomentCanvas({ target, make, onDone }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const el = target.current
    const surface = canvas.current
    const ctx = surface?.getContext("2d")
    if (!el || !surface || !ctx) return
    const ratio = window.devicePixelRatio || 1
    surface.width = window.innerWidth * ratio
    surface.height = window.innerHeight * ratio
    ctx.scale(ratio, ratio)
    const effect = make(el.getBoundingClientRect(), el)
    let frame = 0
    let last = performance.now()
    const tick = (now: number) => {
      const alive = effect.step(Math.min(0.05, (now - last) / 1000))
      last = now
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      effect.draw(ctx)
      if (alive) frame = requestAnimationFrame(tick)
      else onDone()
    }
    // The first frame is drawn at once, so the effect takes over from the number without a gap.
    effect.draw(ctx)
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, make, onDone])

  return createPortal(<canvas ref={canvas} aria-hidden className="pointer-events-none fixed inset-0 z-[111] size-full" />, document.body)
}
