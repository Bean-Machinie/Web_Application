import { useEffect, useState } from "react"
import { dieSnapshot } from "@/lib/dice-snapshot"
import type { Sides } from "@/lib/dice"

// The picture of a die, once it has been drawn; nothing until then.
export function useDieSnapshot(sides: Sides) {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    let current = true
    dieSnapshot(sides)
      .then((snapshot) => current && setUrl(snapshot))
      .catch(() => {})
    return () => {
      current = false
    }
  }, [sides])
  return url
}
