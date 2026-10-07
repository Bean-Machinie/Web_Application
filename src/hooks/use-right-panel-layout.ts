import { useDefaultLayout } from "react-resizable-panels"

// Blocked storage just means the sizes are not remembered.
const storage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value)
    } catch {
      // Not remembered.
    }
  },
}

// How the right panel's two groups share its height, remembered in this browser.
export const useRightPanelLayout = () =>
  useDefaultLayout({ id: "map-builder-right-panel", storage })
