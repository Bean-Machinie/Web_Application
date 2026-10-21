import { useEffect, useState } from "react"

const query = "(prefers-reduced-motion: reduce)"

// Whether the person asked for less motion, and follows the setting.
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia(query).matches)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return reduced
}
