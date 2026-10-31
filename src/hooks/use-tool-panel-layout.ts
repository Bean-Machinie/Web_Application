import { useDefaultLayout } from "react-resizable-panels"
import { storage } from "@/lib/browser-storage"

// How the tool panel's sections share its height, remembered in this browser. It is the
// same for every tool, so a gutter dragged for one is where it is for the next. Another builder
// keeps its own, under its own id.
export const useToolPanelLayout = (id = "map-builder-tool-panel") => useDefaultLayout({ id, storage })
