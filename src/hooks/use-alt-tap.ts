import { useEffect, useRef } from "react"

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))

// Calls "onTap" when Alt is pressed and let go on its own. Alt used with a key or a
// mouse press (Alt+drag, Ctrl+Alt+0) is not a tap, so those keep their meaning.
export function useAltTap(onTap: () => void, enabled: boolean) {
  const latest = useRef(onTap)
  useEffect(() => {
    latest.current = onTap
  })

  useEffect(() => {
    if (!enabled) return
    let pending = false
    const down = (event: KeyboardEvent) => {
      if (event.key === "Alt") pending = !event.repeat && !isTyping(event.target) && !event.ctrlKey && !event.shiftKey
      else pending = false
    }
    const up = (event: KeyboardEvent) => {
      if (event.key !== "Alt") return
      // The browser would otherwise take a lone Alt to mean its menu.
      event.preventDefault()
      if (pending) latest.current()
      pending = false
    }
    const cancel = () => {
      pending = false
    }
    window.addEventListener("keydown", down)
    window.addEventListener("keyup", up)
    window.addEventListener("pointerdown", cancel, true)
    window.addEventListener("blur", cancel)
    return () => {
      window.removeEventListener("keydown", down)
      window.removeEventListener("keyup", up)
      window.removeEventListener("pointerdown", cancel, true)
      window.removeEventListener("blur", cancel)
    }
  }, [enabled])
}
