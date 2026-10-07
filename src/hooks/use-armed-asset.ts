import { useEffect, useState } from "react"

// The piece of art picked in the library to be stamped on the map: it follows
// the pointer and every click on the canvas lays a copy, until Escape (or another
// tool, which the builder arranges). Picking the same piece again puts it down.
export function useArmedAsset(enabled: boolean) {
  const [armed, setArmed] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled || armed === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      setArmed(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [enabled, armed])

  return {
    armed: enabled ? armed : null,
    arm: (id: string) => setArmed((now) => (now === id ? null : id)),
    disarm: () => setArmed(null),
  }
}
