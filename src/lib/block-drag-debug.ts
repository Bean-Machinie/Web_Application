// Temporary: set to false (or delete this file) once block dragging is sorted.
export const DEBUG_BLOCK_DRAG = true

export function debugBlockDrag(...args: unknown[]) {
  if (DEBUG_BLOCK_DRAG) console.debug("[block-drag]", ...args)
}
