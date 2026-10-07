import { BUILDER_TOOLS } from "@/lib/map-builder-tools"
import { GUARD } from "@/lib/shortcut-actions"
import type { useBuilderTools } from "./use-builder-tools"
import { useShortcuts } from "./use-shortcuts"
import type { Handlers } from "./use-shortcuts"

// How far one press of a zoom key goes, and how far an arrow moves art (Shift
// for the larger), in canvas pixels.
const ZOOM_STEP = 1.4
const NUDGE = 1
const NUDGE_BIG = 10

type Options = {
  // Everything is off while publishing.
  enabled: boolean
  tools: ReturnType<typeof useBuilderTools>
  viewport: {
    zoomBy: (factor: number) => void
    zoomTo: (scale: number) => void
    fit: () => void
  }
  undo: () => void
  redo: () => void
  toggleHelp: () => void
}

// What each of the builder's keys does (see shortcut-actions.ts for the keys
// themselves). A key whose action has nothing to work on says so, and is left alone.
export function useBuilderShortcuts({ enabled, tools, viewport, undo, redo, toggleHelp }: Options) {
  const { editing, brush } = tools
  const has = editing.selected.length > 0
  const brushOn = tools.tool === "brush" || tools.tool === "blend"

  const when = (condition: boolean, run: () => void) => () => {
    if (!condition) return false
    run()
  }
  const nudge = (dx: number, dy: number) => (event: KeyboardEvent) => {
    if (!has) return false
    const step = event.shiftKey ? NUDGE_BIG : NUDGE
    editing.nudge(dx * step, dy * step)
  }

  const handlers = {
    ...Object.fromEntries(BUILDER_TOOLS.map(({ id }) => [`tool.${id}`, () => tools.changeTool(id)])),
    "brush.smaller": when(brushOn, () => brush.stepSize(false)),
    "brush.larger": when(brushOn, () => brush.stepSize(true)),
    "view.pan": tools.panHold,
    "view.zoomIn": () => viewport.zoomBy(ZOOM_STEP),
    "view.zoomOut": () => viewport.zoomBy(1 / ZOOM_STEP),
    "view.fit": () => viewport.fit(),
    "view.zoom100": () => viewport.zoomTo(1),
    "edit.selectAll": () => editing.selectAll(),
    "edit.copy": when(has, editing.copy),
    "edit.cut": when(has, editing.cut),
    "edit.paste": () => editing.paste(),
    "edit.duplicate": when(has, editing.duplicate),
    "edit.flipH": when(has, () => editing.flip("x")),
    "edit.flipV": when(has, () => editing.flip("y")),
    "edit.delete": when(has, editing.remove),
    "history.undo": () => undo(),
    "history.redo": () => redo(),
    "help.toggle": () => toggleHelp(),
    // Puts down stamping, even from a field; lets go of the selection except there.
    "select.cancel": (event: KeyboardEvent) => {
      if (tools.armed) return tools.disarm()
      const target = event.target
      if (target instanceof Element && target.closest(GUARD.normal)) return false
      if (!has) return false
      editing.clear()
    },
    "nudge.left": nudge(-1, 0),
    "nudge.right": nudge(1, 0),
    "nudge.up": nudge(0, -1),
    "nudge.down": nudge(0, 1),
  } as Handlers

  useShortcuts(handlers, enabled)
}
