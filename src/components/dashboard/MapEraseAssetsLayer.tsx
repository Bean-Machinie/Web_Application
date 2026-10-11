import { useEffect, useRef } from "react"
import type Konva from "konva"
import type { Pair } from "polygon-clipping"
import { Circle, Group } from "react-konva"
import type { Brush } from "@/hooks/use-brush"
import type { AssetPicker } from "@/lib/map-asset-pick"

const NONE: ReadonlySet<string> = new Set()

type Props = {
  enabled: boolean
  brush: Brush
  pick: AssetPicker
  // The art the stroke has touched so far, which is shown fading.
  onFading: (ids: ReadonlySet<string>) => void
  // The art the stroke touched, when it is let go: all of it is removed as one change.
  onErase: (ids: string[]) => void
}

// The eraser for art: hold the pointer and drag over art to touch it. A piece touched
// anywhere on its painted pixels is touched whole. It fades while the pointer is
// down and goes when it is let go. The ring shows the size, as the brush's does,
// and is the editor's only. The middle button pans.
export function MapEraseAssetsLayer({ enabled, brush, pick, onFading, onErase }: Props) {
  const layer = useRef<Konva.Group>(null)
  const ring = useRef<Konva.Group>(null)
  const latest = useRef({ brush, pick, onFading, onErase })
  useEffect(() => {
    latest.current = { brush, pick, onFading, onErase }
  })

  useEffect(() => {
    const stage = layer.current?.getStage()
    const hint = ring.current
    const node = layer.current
    if (!enabled || !stage) return

    let touched: Set<string> | null = null
    let last: Pair | null = null
    const place = (event: PointerEvent): Pair => {
      stage.setPointersPositions(event)
      const { x, y } = stage.getRelativePointerPosition()!
      return [x, y]
    }
    // Everything from the last point to this one, a stamp of the brush every half radius.
    const touch = (from: Pair, to: Pair) => {
      const { brush, pick, onFading } = latest.current
      const radius = brush.size / 2
      const length = Math.hypot(to[0] - from[0], to[1] - from[1])
      const step = Math.max(radius / 2, 2)
      const before = touched!.size
      for (let at = 0; at <= length; at += step) {
        const share = length > 0 ? at / length : 0
        const x = from[0] + (to[0] - from[0]) * share
        const y = from[1] + (to[1] - from[1]) * share
        for (const id of pick.touching(x, y, radius, touched!)) touched!.add(id)
      }
      if (touched!.size !== before) onFading(new Set(touched))
    }

    const onMove = (event: PointerEvent) => {
      if (!touched || !last) return
      // Every position the pointer passed through since the last event, where the browser reports them.
      const events = event.getCoalescedEvents?.()
      for (const each of events?.length ? events : [event]) {
        const next = place(each)
        touch(last, next)
        last = next
      }
    }
    const end = (commit: boolean) => {
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onCancel)
      const ids = touched
      touched = last = null
      if (!ids) return
      if (commit && ids.size > 0) latest.current.onErase([...ids])
      latest.current.onFading(NONE)
    }
    const onUp = () => end(true)
    const onCancel = () => end(false)

    const onDown = (event: Konva.KonvaEventObject<PointerEvent>) => {
      if (event.evt.button !== 0 || touched) return
      touched = new Set()
      last = place(event.evt)
      touch(last, last)
      window.addEventListener("pointermove", onMove)
      window.addEventListener("pointerup", onUp)
      window.addEventListener("pointercancel", onCancel)
    }
    const onHover = () => {
      const at = stage.getRelativePointerPosition()
      if (!at || !ring.current) return
      ring.current.position(at).visible(true)
      layer.current?.getLayer()?.batchDraw()
    }
    const onLeave = () => {
      ring.current?.visible(false)
      layer.current?.getLayer()?.batchDraw()
    }

    stage.on("pointerdown.erase", onDown)
    stage.on("pointermove.erase", onHover)
    stage.on("pointerleave.erase", onLeave)
    return () => {
      stage.off(".erase")
      if (touched) end(false)
      hint?.visible(false)
      node?.getLayer()?.batchDraw()
    }
  }, [enabled])

  const radius = brush.size / 2
  return (
    <Group ref={layer} listening={false}>
      <Group ref={ring} visible={false}>
        <Circle radius={radius} stroke="rgba(0, 0, 0, 0.5)" strokeWidth={3.5} strokeScaleEnabled={false} />
        <Circle radius={radius} stroke="#fff" strokeWidth={1.5} strokeScaleEnabled={false} />
      </Group>
    </Group>
  )
}
