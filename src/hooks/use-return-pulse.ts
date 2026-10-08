import { useEffect, useState } from "react"
import { forgetReturn, recallReturn } from "@/lib/map-view"

// The marker this map was last left through, if someone is now coming back to
// it, so it can be pulsed. Read once on opening and then forgotten.
export function useReturnPulse(mapId: string) {
  const [markerId] = useState(() => recallReturn(mapId))

  useEffect(() => {
    forgetReturn(mapId)
  }, [mapId])

  return markerId
}
