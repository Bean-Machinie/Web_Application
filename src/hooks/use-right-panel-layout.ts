import { useDefaultLayout } from "react-resizable-panels"
import { storage } from "@/lib/browser-storage"

// How the right panel's two groups share its height, remembered in this browser.
export const useRightPanelLayout = () =>
  useDefaultLayout({ id: "map-builder-right-panel", storage })
