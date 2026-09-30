import { useEffect, useState } from "react"

export type LoadingPhase = "pending" | "skeleton" | "ready"

// A fast load should show no skeleton at all, and a skeleton that does show
// should not vanish a blink later. So it only appears after SHOW_AFTER_MS of
// waiting, and once it has appeared it stays for at least MIN_VISIBLE_MS.
const SHOW_AFTER_MS = 150
const MIN_VISIBLE_MS = 350

// "pending": still loading but not yet worth showing a skeleton, so reserve
// the space invisibly. "skeleton": show it. "ready": show the content.
export function useLoadingPhase(loading: boolean): LoadingPhase {
  const [shown, setShown] = useState(false)
  const [held, setHeld] = useState(false)

  useEffect(() => {
    if (!loading) return

    const show = setTimeout(() => {
      setShown(true)
      setHeld(true)
      setTimeout(() => setHeld(false), MIN_VISIBLE_MS)
    }, SHOW_AFTER_MS)

    return () => clearTimeout(show)
  }, [loading])

  // Ready to start over for the next load.
  useEffect(() => {
    if (loading || held) return
    const reset = setTimeout(() => setShown(false), 0)
    return () => clearTimeout(reset)
  }, [loading, held])

  if (!loading && !held) return "ready"
  return shown ? "skeleton" : "pending"
}
