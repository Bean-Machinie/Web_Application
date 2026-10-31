import { useState } from "react"

// The open tab of a panel, remembered in this browser. An unknown or unreadable value is the first tab.
export function useStoredTab<T extends string>(storageKey: string, tabs: readonly T[]) {
  const [tab, setTab] = useState<T>(() => {
    try {
      return tabs.find((candidate) => candidate === localStorage.getItem(storageKey)) ?? tabs[0]
    } catch {
      return tabs[0]
    }
  })

  function change(next: string) {
    const found = tabs.find((candidate) => candidate === next)
    if (!found) return
    setTab(found)
    try {
      localStorage.setItem(storageKey, found)
    } catch {
      // The tab just will not be remembered.
    }
  }

  return [tab, change] as const
}
