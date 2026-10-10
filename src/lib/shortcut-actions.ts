import { BUILDER_TOOLS } from "./map-builder-tools"
import type { BuilderTool } from "./map-builder-tools"
import type { Binding } from "./shortcut-keys"

// Everything a key can do in the builder. The keys are the defaults; what
// they are now is kept by the store (shortcut-store.ts). What each does is in
// useBuilderShortcuts, and one listener (useShortcuts) finds it by key.

export type ActionId =
  | `tool.${BuilderTool}`
  | "brush.smaller"
  | "brush.larger"
  | "view.pan"
  | "view.zoomIn"
  | "view.zoomOut"
  | "view.fit"
  | "view.zoom100"
  | "view.rotateLeft"
  | "view.rotateRight"
  | "view.resetRotation"
  | "view.flip"
  | "edit.selectAll"
  | "edit.copy"
  | "edit.cut"
  | "edit.paste"
  | "edit.duplicate"
  | "edit.flipH"
  | "edit.flipV"
  | "edit.delete"
  | "history.undo"
  | "history.redo"
  | "help.toggle"
  | "select.cancel"
  | "nudge.left"
  | "nudge.right"
  | "nudge.up"
  | "nudge.down"

// Where a key is left alone because it belongs to what has the focus.
const TYPING = "input, textarea, [contenteditable=true]"
export const GUARD = {
  // Fields, and dialogs.
  normal: `${TYPING}, [role=dialog]`,
  // Undo is the field's own there, but not in a dialog.
  undo: "input, textarea",
  // Help is also what closes its own dialog.
  help: TYPING,
  // Space is also what chooses in a menu or a list.
  space: `${TYPING}, select, [role=dialog], [role=menu], [role=listbox]`,
  // Zoom keys work anywhere.
  none: "",
}

export type Action = {
  id: ActionId
  label: string
  defaults: Binding[]
  guard: string
  // Held for as long as it lasts, with something to do on the way up as well.
  hold?: boolean
  // Not for changing: the key is part of what the action means.
  fixed?: boolean
}

const arrow = (key: string) => [{ key }, { key, shift: true }]

export const ACTIONS: Action[] = [
  ...BUILDER_TOOLS.map(({ id, label, key }) => ({
    id: `tool.${id}` as const,
    label,
    defaults: [{ key: key.toLowerCase() }],
    guard: GUARD.normal,
  })),
  { id: "brush.smaller", label: "Smaller brush", defaults: [{ key: "[" }], guard: GUARD.normal },
  { id: "brush.larger", label: "Larger brush", defaults: [{ key: "]" }], guard: GUARD.normal },
  { id: "view.pan", label: "Pan while held, with any tool", defaults: [{ key: "space" }], guard: GUARD.space, hold: true },
  { id: "view.zoomIn", label: "Zoom in", defaults: [{ key: "+", ctrl: true }, { key: "=", ctrl: true }], guard: GUARD.none },
  { id: "view.zoomOut", label: "Zoom out", defaults: [{ key: "-", ctrl: true }], guard: GUARD.none },
  { id: "view.fit", label: "Fit canvas to view", defaults: [{ key: "0", ctrl: true }], guard: GUARD.none },
  { id: "view.zoom100", label: "Zoom to 100%", defaults: [{ key: "0", ctrl: true, alt: true }], guard: GUARD.none },
  { id: "view.rotateLeft", label: "Rotate view left", defaults: [{ key: "[", ctrl: true }], guard: GUARD.none },
  { id: "view.rotateRight", label: "Rotate view right", defaults: [{ key: "]", ctrl: true }], guard: GUARD.none },
  { id: "view.resetRotation", label: "Reset view rotation and flip", defaults: [{ key: "r", ctrl: true, alt: true }], guard: GUARD.none },
  { id: "view.flip", label: "Flip view horizontally", defaults: [{ key: "h", ctrl: true, shift: true }], guard: GUARD.none },
  { id: "edit.selectAll", label: "Select all art", defaults: [{ key: "a", ctrl: true }], guard: GUARD.normal },
  { id: "edit.copy", label: "Copy", defaults: [{ key: "c", ctrl: true }], guard: GUARD.normal },
  { id: "edit.cut", label: "Cut", defaults: [{ key: "x", ctrl: true }], guard: GUARD.normal },
  { id: "edit.paste", label: "Paste", defaults: [{ key: "v", ctrl: true }], guard: GUARD.normal },
  { id: "edit.duplicate", label: "Duplicate", defaults: [{ key: "d", ctrl: true }], guard: GUARD.normal },
  { id: "edit.flipH", label: "Flip horizontally", defaults: [{ key: "h", shift: true }], guard: GUARD.normal },
  { id: "edit.flipV", label: "Flip vertically", defaults: [{ key: "v", shift: true }], guard: GUARD.normal },
  { id: "edit.delete", label: "Delete", defaults: [{ key: "delete" }, { key: "backspace" }], guard: GUARD.normal },
  { id: "history.undo", label: "Undo", defaults: [{ key: "z", ctrl: true }], guard: GUARD.undo },
  {
    id: "history.redo",
    label: "Redo",
    defaults: [{ key: "z", ctrl: true, shift: true }, { key: "y", ctrl: true }],
    guard: GUARD.undo,
  },
  { id: "help.toggle", label: "Show these shortcuts", defaults: [{ key: "?" }, { key: "/", ctrl: true }], guard: GUARD.help },
  // Looks for itself whether it is in a field: it also puts down stamping there.
  { id: "select.cancel", label: "Let go of the selection, or stop stamping", defaults: [{ key: "escape" }], guard: GUARD.none, fixed: true },
  { id: "nudge.left", label: "Nudge left", defaults: arrow("arrowleft"), guard: GUARD.normal, fixed: true },
  { id: "nudge.right", label: "Nudge right", defaults: arrow("arrowright"), guard: GUARD.normal, fixed: true },
  { id: "nudge.up", label: "Nudge up", defaults: arrow("arrowup"), guard: GUARD.normal, fixed: true },
  { id: "nudge.down", label: "Nudge down", defaults: arrow("arrowdown"), guard: GUARD.normal, fixed: true },
]

// How the overview groups them. A row is an action, or something that is not a
// key and so cannot be changed: a mouse gesture, shown as it is.
type Row = { action: ActionId } | { label: string; keys: string[] }

export const SHORTCUT_GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: "Tools",
    rows: [
      ...BUILDER_TOOLS.map(({ id }) => ({ action: `tool.${id}` as const })),
      { action: "view.pan" },
      { label: "Next sub tool (tap)", keys: ["Alt"] },
    ],
  },
  { title: "Brush", rows: [{ action: "brush.smaller" }, { action: "brush.larger" }] },
  {
    title: "View",
    rows: [
      { action: "view.zoomIn" },
      { action: "view.zoomOut" },
      { action: "view.fit" },
      { action: "view.zoom100" },
      { action: "view.rotateLeft" },
      { action: "view.rotateRight" },
      { action: "view.resetRotation" },
      { action: "view.flip" },
      { label: "Zoom at the pointer", keys: ["Scroll"] },
      { label: "Pan with any tool", keys: ["Middle drag"] },
    ],
  },
  {
    title: "Selecting",
    rows: [
      { label: "Add or remove a piece", keys: ["Shift", "Click"] },
      { label: "Select what a box touches", keys: ["Drag"] },
      { label: "Add a box to the selection", keys: ["Shift", "Drag"] },
      { action: "edit.selectAll" },
      { label: "Drag a copy", keys: ["Alt", "Drag"] },
      { label: "Nudge by 1 px, or 10 with Shift", keys: ["Arrows"] },
      { action: "select.cancel" },
    ],
  },
  {
    title: "Editing art",
    rows: [
      { action: "edit.copy" },
      { action: "edit.cut" },
      { action: "edit.paste" },
      { action: "edit.duplicate" },
      { action: "edit.flipH" },
      { action: "edit.flipV" },
      { action: "edit.delete" },
    ],
  },
  { title: "Library", rows: [{ label: "Pick art, then stamp it with every click", keys: ["Click"] }] },
  {
    title: "History and help",
    rows: [{ action: "history.undo" }, { action: "history.redo" }, { action: "help.toggle" }],
  },
]
