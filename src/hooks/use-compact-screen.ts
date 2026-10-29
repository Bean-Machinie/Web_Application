import { useEffect, useState } from "react"

// Below this the quick builder stacks: the character above the picker, with no tool strip.
const query = "(max-width: 999px)"

export function useCompactScreen() {
  const [compact, setCompact] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = (event: MediaQueryListEvent) => setCompact(event.matches)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])
  return compact
}
