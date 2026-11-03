import { useEffect, useRef, useState } from "react"
import type { RefObject } from "react"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { openStylePreview } from "@/lib/dice-style-preview"
import type { StylePreview } from "@/lib/dice-style-preview"
import type { DiceStyle } from "@/lib/dice-styles"

type Areas = RefObject<Record<string, HTMLElement | null>>

// The 3D d20s of the style picker, loaded when it opens and let go of when it closes. Until then a card
// shows a skeleton; if the library cannot start, the cards simply have no die.
export function useStylePreview(host: RefObject<HTMLElement | null>, areas: Areas, styles: DiceStyle[]) {
  const reducedMotion = useReducedMotion()
  const preview = useRef<StylePreview | null>(null)
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading")

  useEffect(() => {
    if (!host.current) return
    let closed = false
    let opened: StylePreview | undefined
    openStylePreview(host.current, () => areas.current, styles, reducedMotion)
      .then((result) => {
        if (closed) return result.close()
        opened = preview.current = result
        setState("ready")
      })
      .catch((error) => {
        console.error("The style preview could not start", error)
        if (!closed) setState("failed")
      })
    return () => {
      closed = true
      opened?.close()
      preview.current = null
    }
  }, [host, areas, styles, reducedMotion])

  return { state, hover: (id: string | null) => preview.current?.hover(id) }
}
