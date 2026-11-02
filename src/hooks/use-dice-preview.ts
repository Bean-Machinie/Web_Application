import { useEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { openDicePreview } from "@/lib/dice-preview"
import type { DicePreview } from "@/lib/dice-preview"
import type { Sides } from "@/lib/dice"

type Areas = RefObject<Partial<Record<Sides, HTMLElement | null>>>

// The 3D dice of the tray, loaded when the panel opens. Until then a tile shows a skeleton; if
// the library cannot start, the tiles keep their labels.
export function useDicePreview(host: RefObject<HTMLElement | null>, areas: Areas) {
  const reducedMotion = useReducedMotion()
  const preview = useRef<DicePreview | null>(null)
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading")

  useEffect(() => {
    if (!host.current) return
    let closed = false
    let opened: DicePreview | undefined
    openDicePreview(host.current, () => areas.current, reducedMotion)
      .then((result) => {
        if (closed) return result.close()
        opened = preview.current = result
        setState("ready")
      })
      .catch(() => !closed && setState("failed"))
    return () => {
      closed = true
      opened?.close()
      preview.current = null
    }
  }, [host, areas, reducedMotion])

  return {
    state,
    hover: (sides: Sides | null) => preview.current?.hover(sides),
    throwDie: (sides: Sides) => preview.current?.throwDie(sides),
  }
}
