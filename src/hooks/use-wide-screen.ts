import { useEffect, useState } from "react"

// A landscape tablet, and anything wider: what the map builder needs.
const query = "(min-width: 1024px)"

// Whether the window is wide enough for the map builder, and follows it as it turns
// or is resized.
export function useWideScreen() {
  const [wide, setWide] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => setWide(event.matches)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])
  return wide
}
