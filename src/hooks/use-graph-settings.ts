import { useState } from "react"
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from "@/lib/graph-settings"
import type { GraphSettings } from "@/lib/graph-settings"

// The graph's settings, remembered in this browser, and changed live.
export function useGraphSettings() {
  const [settings, setSettings] = useState(loadSettings)

  function change(patch: Partial<GraphSettings>) {
    setSettings((old) => {
      const next = { ...old, ...patch }
      saveSettings(next)
      return next
    })
  }

  function reset() {
    saveSettings(DEFAULT_SETTINGS)
    setSettings(DEFAULT_SETTINGS)
  }

  return { settings, change, reset }
}
