// Ctrl and Alt held with a press of the mouse resize the brush instead of painting (see
// MapBrushResize). Cmd stands for Ctrl, as it does for the keys.
export const isResizeGesture = (event: { ctrlKey: boolean; metaKey: boolean; altKey: boolean }) =>
  (event.ctrlKey || event.metaKey) && event.altKey

// Whether the brush is being resized now, for the rings the brushes show over the map to
// leave themselves where they are while it is.
export const resizing = { active: false }
