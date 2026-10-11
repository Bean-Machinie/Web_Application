import { useDefaultLayout } from "react-resizable-panels"
import { storage } from "./use-right-panel-layout"

// How the tool panel's sections share its height, remembered in this browser. It is the
// same for every tool, so a gutter dragged for one is where it is for the next.
export const useToolPanelLayout = () => useDefaultLayout({ id: "map-builder-tool-panel", storage })
