import { useEffect, useState } from "react"

// Whether Alt is down, for a shortcut that flips a mode while it is held.
export function useAltHeld() {
  const [held, setHeld] = useState(false)

  useEffect(() => {
    const track = (event: KeyboardEvent) => setHeld(event.altKey)
    const release = () => setHeld(false)
    window.addEventListener("keydown", track)
    window.addEventListener("keyup", track)
    // Alt-tabbing away would otherwise leave it "held".
    window.addEventListener("blur", release)
    return () => {
      window.removeEventListener("keydown", track)
      window.removeEventListener("keyup", track)
      window.removeEventListener("blur", release)
    }
  }, [])

  return held
}
