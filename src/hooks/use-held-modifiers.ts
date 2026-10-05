import { useEffect, useState } from "react"

// Whether Alt and Shift are down, for shortcuts that change what a drag does
// for as long as they are held.
export function useHeldModifiers() {
  const [held, setHeld] = useState({ alt: false, shift: false })

  useEffect(() => {
    const track = (event: KeyboardEvent) =>
      setHeld((old) =>
        old.alt === event.altKey && old.shift === event.shiftKey
          ? old
          : { alt: event.altKey, shift: event.shiftKey }
      )
    const release = () => setHeld({ alt: false, shift: false })
    window.addEventListener("keydown", track)
    window.addEventListener("keyup", track)
    // Switching windows would otherwise leave a key "held".
    window.addEventListener("blur", release)
    return () => {
      window.removeEventListener("keydown", track)
      window.removeEventListener("keyup", track)
      window.removeEventListener("blur", release)
    }
  }, [])

  return held
}
