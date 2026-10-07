import { useState } from "react"

export type RightTab = "map" | "properties" | "navigator"

// Which tab of the right panel's top group is showing. Selecting art brings up
// Properties by itself, but only from the Map tab: with the Navigator open, it
// stays. When the selection clears, the tab that was showing before comes back. A
// tab picked by hand is never taken away from the person who picked it.
export function useSelectionTab(hasSelection: boolean) {
  const [tab, setTab] = useState<RightTab>("navigator")
  // The tab to go back to, set only when Properties was opened by selecting.
  const [before, setBefore] = useState<RightTab | null>(null)
  const [had, setHad] = useState(hasSelection)

  // Changed while rendering, as it follows from the selection alone.
  if (hasSelection !== had) {
    setHad(hasSelection)
    if (hasSelection && tab === "map") {
      setBefore(tab)
      setTab("properties")
    } else if (!hasSelection && before) {
      setTab(before)
      setBefore(null)
    }
  }

  const pick = (next: RightTab) => {
    setTab(next)
    setBefore(null)
  }

  return [tab, pick] as const
}
