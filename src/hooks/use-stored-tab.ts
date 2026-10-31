import { useStoredValue } from "./use-stored-value"

// The open tab of a panel, remembered in this browser. An unknown or unreadable value is the first tab.
export function useStoredTab<T extends string>(storageKey: string, tabs: readonly T[]) {
  const [tab, setTab] = useStoredValue<T>(storageKey, (text) => tabs.find((candidate) => candidate === text) ?? tabs[0])
  const change = (next: string) => {
    const found = tabs.find((candidate) => candidate === next)
    if (found) setTab(found)
  }

  return [tab, change] as const
}
