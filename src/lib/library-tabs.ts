import { isSrdNode, srdSectionOf } from "./srd-items"

// A tab of the library's detail panel: a world entry, an SRD creature or an SRD rule.
export type LibraryStep = { kind: "entry" | "creature" | "rule"; id: string }
// `trail` is where a link inside the tab was followed from, the last being the one to go back to.
export type LibraryTab = LibraryStep & { trail?: LibraryStep[] }
export type LibraryTabs = { tabs: LibraryTab[]; active: number }

export const NO_TABS: LibraryTabs = { tabs: [], active: 0 }

const KINDS = ["entry", "creature", "rule"]

export function readTabs(text: string | null): LibraryTabs {
  try {
    const saved = JSON.parse(text ?? "null") as LibraryTabs | null
    const tabs = (saved?.tabs ?? []).filter((tab) => KINDS.includes(tab?.kind) && typeof tab.id === "string")
    return { tabs, active: Math.min(Math.max(saved?.active ?? 0, 0), Math.max(tabs.length - 1, 0)) }
  } catch {
    return NO_TABS
  }
}

export const writeTabs = (state: LibraryTabs) => JSON.stringify(state)

// What a click on an item of the node that is open makes of it.
export const tabKindFor = (nodeId: string): LibraryTab["kind"] =>
  !isSrdNode(nodeId) ? "entry" : srdSectionOf(nodeId) === "rules" ? "rule" : "creature"

// Already open: that tab is shown. Otherwise "here" takes the place of the one showing, as in the
// journal, and "new" is added after it.
export function openTab(state: LibraryTabs, tab: LibraryTab, where: "here" | "new"): LibraryTabs {
  const at = state.tabs.findIndex((open) => open.kind === tab.kind && open.id === tab.id)
  if (at >= 0) return { ...state, active: at }
  if (where === "here" && state.tabs.length > 0) return { ...state, tabs: state.tabs.map((open, i) => (i === state.active ? tab : open)) }
  return { tabs: [...state.tabs, tab], active: state.tabs.length }
}

// A link inside the tab to a rule: the tab shows the rule, and keeps what it showed to go back to.
export function followRule(state: LibraryTabs, id: string): LibraryTabs {
  const current = state.tabs[state.active]
  if (!current) return openTab(state, { kind: "rule", id }, "new")
  if (current.kind === "rule" && current.id === id) return state
  const step: LibraryStep = { kind: current.kind, id: current.id }
  const tab: LibraryTab = { kind: "rule", id, trail: [...(current.trail ?? []), step] }
  return { ...state, tabs: state.tabs.map((open, i) => (i === state.active ? tab : open)) }
}

export function backTab(state: LibraryTabs): LibraryTabs {
  const current = state.tabs[state.active]
  const trail = current?.trail ?? []
  if (trail.length === 0) return state
  const previous = trail[trail.length - 1]
  const tab: LibraryTab = { ...previous, trail: trail.slice(0, -1) }
  return { ...state, tabs: state.tabs.map((open, i) => (i === state.active ? tab : open)) }
}

export function closeTab(state: LibraryTabs, index: number): LibraryTabs {
  const tabs = state.tabs.filter((_, i) => i !== index)
  const active = index < state.active || state.active >= tabs.length ? state.active - 1 : state.active
  return { tabs, active: Math.max(active, 0) }
}
