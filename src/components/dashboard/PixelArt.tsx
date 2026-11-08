import { useEffect, useRef } from "react"
import { useReducedMotion } from "motion/react"
import { useElementSize } from "@/hooks/use-element-size"
import { ART } from "@/lib/pixel-art/art"
import type { ArtKind } from "@/lib/pixel-art/art"
import { Buf } from "@/lib/pixel-art/buffer"
import type { Rgb } from "@/lib/pixel-art/buffer"
import { FPS } from "@/lib/pixel-art/effect"
import { cn } from "@/lib/utils"

// One pixel of the picture is this many on screen, so it is drawn at a third of the size and scaled up.
const SCALE = 3
// Steps run before the first frame, so the particles are already spread out.
const WARM_STEPS = 80

// The colour of the text here, as red, green and blue, for the lighter shade of the textures. A canvas
// turns any colour the browser knows into pixels, which is the surest way to read one.
function inkOf(element: HTMLElement): Rgb {
  const probe = document.createElement("canvas").getContext("2d")
  if (!probe) return [255, 255, 255]
  probe.fillStyle = getComputedStyle(element).color
  probe.fillRect(0, 0, 1, 1)
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}

type CanvasProps = { kind: ArtKind; w: number; h: number; seed: number }

function ArtCanvas({ kind, w, h, seed }: CanvasProps) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    const element = canvas.current
    const context = element?.getContext("2d")
    if (!element || !context) return

    const art = ART[kind]
    const image = context.createImageData(w, h)
    const frame = new Buf(w, h, new Uint32Array(image.data.buffer))
    const texture = new Buf(w, h)
    art.texture(texture, inkOf(element), seed)
    const effect = art.effect(w, h, seed)
    for (let i = 0; i < WARM_STEPS; i++) effect.step()

    const draw = () => {
      frame.data.set(texture.data)
      effect.draw(frame)
      context.putImageData(image, 0, 0)
    }
    draw()
    if (reduced) return

    let visible = true
    let last = performance.now()
    let id = 0
    const tick = (now: number) => {
      id = requestAnimationFrame(tick)
      if (!visible || document.hidden) {
        last = now
        return
      }
      if (now - last < 1000 / FPS - 2) return
      last = now
      effect.step()
      draw()
    }
    id = requestAnimationFrame(tick)
    const observer = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
    observer.observe(element)
    return () => {
      cancelAnimationFrame(id)
      observer.disconnect()
    }
  }, [kind, w, h, seed, reduced])

  return <canvas ref={canvas} width={w} height={h} aria-hidden className="absolute inset-0 size-full [image-rendering:pixelated]" />
}

type Props = { kind: ArtKind; seed?: number; className?: string }

// A card's art: a texture with particles moving over it, in pixels three times the size they are
// drawn at, with hard edges. It fills its parent, whatever the size, and is redrawn at the new size when
// that changes. It runs at 24 frames a second only while on screen and the tab is showing, and for
// someone who asks for less motion it is one still frame.
export function PixelArt({ kind, seed = 11, className }: Props) {
  const { ref, size } = useElementSize<HTMLDivElement>()
  const w = Math.ceil(size.width / SCALE)
  const h = Math.ceil(size.height / SCALE)

  return (
    <div ref={ref} className={cn("relative text-foreground", className)}>
      {w > 8 && h > 8 && <ArtCanvas kind={kind} w={w} h={h} seed={seed} />}
    </div>
  )
}
