import { useLayoutEffect } from "react"
import type { RefObject } from "react"

// The width of the thin scrollbar, set on the element as --scrollbar-width so that what sits above a
// scroller can keep the same side margins as the content inside it.
export function useScrollbarWidth(target: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const probe = document.createElement("div")
    probe.style.cssText = "position:absolute;visibility:hidden;overflow:scroll;width:50px;height:50px;scrollbar-width:thin"
    document.body.appendChild(probe)
    const width = probe.offsetWidth - probe.clientWidth
    probe.remove()
    target.current?.style.setProperty("--scrollbar-width", `${width}px`)
  }, [target])
}
