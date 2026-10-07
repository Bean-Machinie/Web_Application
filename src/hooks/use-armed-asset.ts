import { useState } from "react"

// The piece of art picked in the library to be stamped on the map: it follows
// the pointer and every click on the canvas lays a copy, until Escape (see the
// cancel shortcut) or another tool, which the builder arranges. Picking the same
// piece again puts it down.
export function useArmedAsset(enabled: boolean) {
  const [armed, setArmed] = useState<string | null>(null)

  return {
    armed: enabled ? armed : null,
    arm: (id: string) => setArmed((now) => (now === id ? null : id)),
    disarm: () => setArmed(null),
  }
}
