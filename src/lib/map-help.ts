import type { BuilderTool, LandTool, PanMode } from "./map-builder-tools"
import type { ActionId } from "./shortcut-actions"

// One line of a help card: what it does, and how. A key that is one of the builder's
// has its action, and is read from the shortcut registry, so it is right for the keys the
// person has chosen. A key that is a modifier of a mouse gesture, or the gesture itself,
// is written in.
export type HelpRow = { label: string; action?: ActionId; keys?: string[]; gesture?: string }

const NEXT_SUB_TOOL: HelpRow = { label: "Next sub tool", keys: ["Alt"], gesture: "tap" }

const LAND: HelpRow[] = [
  { label: "Switch add and cut", keys: ["Alt"], gesture: "tap" },
]

const SHAPES: HelpRow[] = [
  ...LAND,
  { label: "Fit a shape to a box", gesture: "Drag" },
  { label: "Place it at the last size", gesture: "Click" },
  { label: "Stretch it freely", keys: ["Shift"], gesture: "+ drag" },
  { label: "Turn in steps of 15°", keys: ["Shift"], gesture: "+ turn" },
  { label: "Flip horizontally", action: "edit.flipH" },
  { label: "Flip vertically", action: "edit.flipV" },
  { label: "Step back through edits", action: "history.undo" },
  { label: "Apply", action: "shape.apply" },
  { label: "Cancel", action: "shape.cancel" },
]

const BRUSH: HelpRow[] = [
  { label: "Smaller brush", action: "brush.smaller" },
  { label: "Larger brush", action: "brush.larger" },
  NEXT_SUB_TOOL,
]

const SELECT: HelpRow[] = [
  { label: "Select art", gesture: "Click" },
  { label: "Add or remove", keys: ["Shift"], gesture: "+ click" },
  { label: "Select with the sub tool", gesture: "Drag on empty canvas" },
  { label: "Add to the selection", keys: ["Shift"], gesture: "+ drag" },
  { label: "Take out of the selection", keys: ["Alt"], gesture: "+ drag" },
  { label: "Keep what is in both", keys: ["Shift", "Alt"], gesture: "+ drag" },
  { label: "Duplicate", keys: ["Alt"], gesture: "+ drag art" },
  { label: "Scale freely", keys: ["Shift"], gesture: "+ scale" },
  { label: "Turn in steps of 15°", keys: ["Shift"], gesture: "+ turn" },
  { label: "Select all", action: "edit.selectAll" },
  NEXT_SUB_TOOL,
]

const pan = (mode: PanMode): HelpRow[] => [
  { label: mode === "rotate" ? "Turn the canvas" : "Move the canvas", gesture: "Drag" },
  ...(mode === "rotate" ? [{ label: "Turn in steps of 15°", keys: ["Shift"], gesture: "+ drag" }] : []),
  { label: "Pan with any tool", action: "view.pan" },
  { label: "Pan with any tool", gesture: "Middle drag" },
  { label: "Zoom at the pointer", gesture: "Scroll" },
  NEXT_SUB_TOOL,
]

// The help of the Assets header: how art gets onto the map.
export const ASSET_HELP: HelpRow[] = [
  { label: "Pick art, then stamp it", gesture: "Click, then click the map" },
  { label: "Place art", gesture: "Drag onto the map" },
  { label: "Stop stamping", action: "select.cancel" },
]

// What a tool's help card says: the same for any tab of a tool, but the Land tool's two
// ways of drawing and the pan tool's two ways of moving.
export function helpFor(tool: BuilderTool, landTool: LandTool, panMode: PanMode): HelpRow[] {
  if (tool === "land") return landTool === "lasso" ? LAND : SHAPES
  if (tool === "select") return SELECT
  if (tool === "hand") return pan(panMode)
  // The blend brush has the one way of working, so no next sub tool.
  if (tool === "blend") return BRUSH.slice(0, 2)
  if (tool === "brush" || tool === "eraser") return BRUSH
  return []
}
