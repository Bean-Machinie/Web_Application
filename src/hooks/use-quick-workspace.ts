import { useCallback, useState } from "react"
import type { Workspace } from "@/lib/quick-workspace"
import { useQuickShortcuts } from "./use-quick-shortcuts"

// Which workspace of the character builder is open, and whether its left panel is (shut to begin
// with, so the centre has the room). A pick of the ability scores opens their workspace; every
// other pick opens its panel (`showPick`). A word of the sentence is in the Build workspace (`showSlot`).
export function useQuickWorkspace(showPick: (key: string) => void, showSlot: (slot: string | null) => void) {
  const [workspace, setWorkspace] = useState<Workspace>("build")
  const [panelOpen, setPanelOpen] = useState(false)
  useQuickShortcuts(useCallback((next: Workspace) => setWorkspace(next), []))

  return {
    workspace,
    setWorkspace,
    panelOpen,
    setPanelOpen,
    openPick: (key: string) => (key === "abilities" ? setWorkspace("abilities") : showPick(key)),
    openSlot: (slot: string | null) => {
      setWorkspace("build")
      showSlot(slot)
    },
  }
}
