import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { WORKSPACES } from "@/lib/quick-workspace"
import type { Workspace } from "@/lib/quick-workspace"
import { useQuickShortcuts } from "./use-quick-shortcuts"

// Which workspace of the character builder is open, and whether its left panel is (shut to begin
// with, so the centre has the room). A pick of the ability scores opens their workspace; every
// other pick opens its panel (`showPick`). A word of the sentence is in the Build workspace (`showSlot`).
// A link can open a workspace with `?workspace=abilities`, which is then taken off the address.
export function useQuickWorkspace(showPick: (key: string) => void, showSlot: (slot: string | null) => void) {
  const [params, setParams] = useSearchParams()
  const linked = WORKSPACES.find(({ id }) => id === params.get("workspace"))?.id
  const [workspace, setWorkspace] = useState<Workspace>(linked ?? "build")
  useEffect(() => {
    if (linked) setParams((old) => (old.delete("workspace"), old), { replace: true })
  }, [linked, setParams])
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
