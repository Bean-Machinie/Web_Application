// What is open in the journal: up to two panes side by side, each a row of tabs
// with one showing. A tab is a journal page or a world entry, and the same one
// is never open twice, because two editors on one document would overwrite each
// other's autosave. What a kind is (its icon, its content) is registered where the
// journal draws tabs; here it is only a name.
export type Tab = { kind: string; id: string }
export type Pane = { tabs: Tab[]; active: number }
export type Workspace = { panes: Pane[]; focused: number }

export const MAX_PANES = 2
export const EMPTY_WORKSPACE: Workspace = { panes: [{ tabs: [], active: 0 }], focused: 0 }

export const tabKey = (tab: Tab) => `${tab.kind}:${tab.id}`

export function locate(ws: Workspace, key: string) {
  for (const [pane, { tabs }] of ws.panes.entries()) {
    const index = tabs.findIndex((tab) => tabKey(tab) === key)
    if (index >= 0) return { pane, index, tab: tabs[index] }
  }
  return null
}

export function activeTab(ws: Workspace): Tab | null {
  const pane = ws.panes[ws.focused]
  return pane?.tabs[pane.active] ?? null
}

const clone = (ws: Workspace) => ws.panes.map((pane) => ({ ...pane, tabs: [...pane.tabs] }))

// After a tab leaves a pane, the one that takes its place is showing.
function settle(pane: Pane, removedAt: number) {
  const next = pane.active > removedAt ? pane.active - 1 : pane.active
  pane.active = Math.max(0, Math.min(next, pane.tabs.length - 1))
}

// A pane that has just run out of tabs goes, unless it is the only one.
function without(panes: Pane[], emptied: Pane) {
  return panes.length > 1 && emptied.tabs.length === 0 ? panes.filter((pane) => pane !== emptied) : panes
}

export function focusTab(ws: Workspace, pane: number, index: number, focus = true): Workspace {
  const panes = clone(ws)
  panes[pane].active = index
  return { panes, focused: focus ? pane : ws.focused }
}

export const focusPane = (ws: Workspace, pane: number): Workspace =>
  ws.focused === pane ? ws : { ...ws, focused: pane }

// current: in place of the tab showing in the focused pane. newTab: after the last
// one of a pane. other: in the pane beside `from`, made if there is only one.
export type Where =
  | { kind: "current" }
  | { kind: "newTab"; pane?: number }
  | { kind: "other"; from?: number }

export function openTab(ws: Workspace, tab: Tab, where: Where, focus = true): Workspace {
  const found = locate(ws, tabKey(tab))
  if (found) return focusTab(ws, found.pane, found.index, focus)

  const panes = clone(ws)
  let target = ws.focused
  if (where.kind === "newTab") target = where.pane ?? ws.focused
  if (where.kind === "other") {
    const from = where.from ?? ws.focused
    if (panes.length < MAX_PANES) panes.push({ tabs: [], active: 0 })
    target = panes.length > 1 && from === 0 ? 1 : 0
  }

  const pane = panes[target]
  if (where.kind === "current" && pane.tabs.length > 0) {
    pane.tabs[pane.active] = tab
  } else {
    pane.tabs.push(tab)
    pane.active = pane.tabs.length - 1
  }
  return { panes, focused: focus ? target : ws.focused }
}

export function closeTab(ws: Workspace, paneIndex: number, index: number): Workspace {
  const panes = clone(ws)
  const pane = panes[paneIndex]
  const focusedPane = panes[ws.focused]
  pane.tabs.splice(index, 1)
  settle(pane, index)
  const left = without(panes, pane)
  return { panes: left, focused: Math.max(0, left.indexOf(focusedPane)) }
}

// A tab dragged to a place: in a pane at an index (the end if none), or in a
// pane of its own. It is then the one showing, and its pane the focused one.
export type Place = { pane: number; index?: number } | "newPane"

export function moveTab(ws: Workspace, key: string, place: Place): Workspace {
  const from = locate(ws, key)
  if (!from || (place === "newPane" && ws.panes.length >= MAX_PANES)) return ws

  const panes = clone(ws)
  const source = panes[from.pane]
  source.tabs.splice(from.index, 1)
  if (place === "newPane") panes.push({ tabs: [], active: 0 })
  const destination = place === "newPane" ? panes[panes.length - 1] : panes[place.pane]
  if (destination !== source) settle(source, from.index)

  const at = place !== "newPane" && place.index !== undefined ? place.index : destination.tabs.length
  destination.tabs.splice(at, 0, from.tab)
  destination.active = at
  const left = destination === source ? panes : without(panes, source)
  return { panes: left, focused: left.indexOf(destination) }
}

// The focused pane's tab showing moves into a pane of its own, or when it is the
// only tab, an empty pane opens beside it for whatever is opened next.
export function splitRight(ws: Workspace): Workspace {
  if (ws.panes.length >= MAX_PANES) return ws
  const tab = activeTab(ws)
  if (tab && ws.panes[ws.focused].tabs.length > 1) return moveTab(ws, tabKey(tab), "newPane")
  return { panes: [...clone(ws), { tabs: [], active: 0 }], focused: ws.panes.length }
}

export function stepTab(ws: Workspace, step: 1 | -1): Workspace {
  const pane = ws.panes[ws.focused]
  if (!pane || pane.tabs.length < 2) return ws
  return focusTab(ws, ws.focused, (pane.active + step + pane.tabs.length) % pane.tabs.length)
}

// Every tab but the one, in its pane, which is then the pane in focus.
export function closeOthers(ws: Workspace, paneIndex: number, index: number): Workspace {
  const panes = clone(ws)
  const pane = panes[paneIndex]
  pane.tabs = [pane.tabs[index]]
  pane.active = 0
  return { panes, focused: paneIndex }
}

// Takes out the tabs `keeps` says no to (their page or entry is gone).
export function pruneTabs(ws: Workspace, keeps: (tab: Tab) => boolean): Workspace {
  if (ws.panes.every((pane) => pane.tabs.every(keeps))) return ws

  const panes = ws.panes.map((pane) => {
    const showing = pane.tabs[pane.active]
    const tabs = pane.tabs.filter(keeps)
    const at = showing ? tabs.findIndex((tab) => tabKey(tab) === tabKey(showing)) : -1
    return { tabs, active: at >= 0 ? at : Math.max(0, Math.min(pane.active, tabs.length - 1)) }
  })
  // A pane that this emptied goes; one that was already empty (just split) stays.
  const kept = panes.filter((pane, i) => pane.tabs.length > 0 || ws.panes[i].tabs.length === 0)
  const left = kept.length > 0 ? kept : [panes[0]]
  return { panes: left, focused: Math.max(0, left.indexOf(panes[ws.focused])) }
}
