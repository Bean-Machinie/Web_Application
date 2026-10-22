// The part of the graph that is on screen, so that what is off it is not drawn.
export function createFrame() {
  let left = -Infinity
  let top = -Infinity
  let right = Infinity
  let bottom = Infinity

  return {
    set(x0: number, y0: number, x1: number, y1: number, margin: number) {
      left = x0 - margin
      top = y0 - margin
      right = x1 + margin
      bottom = y1 + margin
    },
    sees: (x: number, y: number) => x >= left && x <= right && y >= top && y <= bottom,
    // A line is off screen when both its ends are past the same edge.
    misses: (ax: number, ay: number, bx: number, by: number) =>
      (ax < left && bx < left) || (ax > right && bx > right) || (ay < top && by < top) || (ay > bottom && by > bottom),
  }
}

export type Frame = ReturnType<typeof createFrame>
