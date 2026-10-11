import type { Pair } from "polygon-clipping"

// Where a stamp's box is on the canvas, before it is turned: its middle and its size.
export type Frame = { x: number; y: number; width: number; height: number }

// How much of the canvas's shorter side the longer side of a stamp takes when it is
// placed with a click for the first time.
const FIRST_SHARE = 0.12

// The box dragged from one corner to the other. With "keep", the shape keeps
// its own proportions ("aspect", width to height) and fills as much of the dragged
// box as it can, from the corner where the drag began.
export function dragFrame(from: Pair, to: Pair, keep: boolean, aspect: number): Frame {
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  let width = Math.abs(dx)
  let height = Math.abs(dy)
  if (keep) {
    if (width / Math.max(height, 1e-9) > aspect) width = height * aspect
    else height = width / aspect
  }
  return { x: from[0] + (Math.sign(dx) || 1) * (width / 2), y: from[1] + (Math.sign(dy) || 1) * (height / 2), width, height }
}

// The box a click places: the size of the last shape placed, or the first time a share
// of the canvas's shorter side, with the stamp's own proportions.
export function clickFrame(
  at: Pair,
  aspect: number,
  canvas: { width: number; height: number },
  last: { width: number; height: number } | null
): Frame {
  if (last) return { x: at[0], y: at[1], ...last }
  const side = Math.min(canvas.width, canvas.height) * FIRST_SHARE
  return aspect >= 1
    ? { x: at[0], y: at[1], width: side, height: side / aspect }
    : { x: at[0], y: at[1], width: side * aspect, height: side }
}
