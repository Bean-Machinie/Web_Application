import { useDefaultLayout } from "react-resizable-panels"
import { storage } from "./use-right-panel-layout"

// How one tool's sections share the tool panel's height, remembered in this browser.
export const useToolPanelLayout = (tool: string) =>
  useDefaultLayout({ id: `map-builder-tool-${tool}`, storage })
