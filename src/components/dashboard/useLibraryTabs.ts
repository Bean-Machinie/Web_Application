import { useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { useStoredValue } from "@/hooks/use-stored-value"
import { backTab, closeTab, followRule, openTab, readTabs, tabKindFor, writeTabs } from "@/lib/library-tabs"

export type LibraryTabsState = ReturnType<typeof useLibraryTabs>

// The tabs of the detail panel, kept in this browser so they stay across nodes and reloads. A link
// that carries ?item= (a card, a row) opens that item in the tab showing, and the address is
// cleaned of it.
export function useLibraryTabs(nodeId: string, storageKey = "library-tabs") {
  const [state, setState] = useStoredValue(storageKey, readTabs, writeTabs)
  const [params, setParams] = useSearchParams()
  const asked = params.get("item")

  useEffect(() => {
    if (!asked) return
    setState(openTab(state, { kind: tabKindFor(nodeId), id: asked }, "here"))
    setParams(
      (current) => {
        current.delete("item")
        return current
      },
      { replace: true }
    )
    // Only a new link is acted on, not the state it changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asked])

  const activeTab = state.tabs[state.active] ?? null
  return {
    tabs: state.tabs,
    active: state.active,
    activeTab,
    show: (index: number) => setState({ ...state, active: index }),
    close: (index: number) => setState(closeTab(state, index)),
    openNew: (id: string) => setState(openTab(state, { kind: tabKindFor(nodeId), id }, "new")),
    // A link inside the tab to a rule: the tab shows it, with a way back to what it showed.
    openRule: (id: string) => setState(followRule(state, id)),
    back: () => setState(backTab(state)),
  }
}
