import { useEffect, useRef, useState } from "react"

// The sum of a burst of changes, shown until things go quiet for a moment.
export function useRunningTotal(visibleMs = 1000) {
  const [total, setTotal] = useState(0)
  const [active, setActive] = useState(false)
  const sum = useRef(0)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  function add(change: number) {
    // A new burst starts from zero once the last one has faded.
    sum.current = (active ? sum.current : 0) + change
    setTotal(sum.current)
    setActive(true)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setActive(false), visibleMs)
  }

  return { total, visible: active && total !== 0, add }
}
