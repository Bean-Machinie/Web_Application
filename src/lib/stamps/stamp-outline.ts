import type { Pair, Polygon, Ring } from "polygon-clipping"
import { outlineOf } from "./stamps"
import type { Stamp } from "./stamps"

// A stamp's outline in canvas pixels, "at" taking a point of the box (0 to 1 each way)
// to where it is on the canvas. "width" and "height" are how big the box is drawn,
// which a round shape is made for.
export function placeStamp(
  stamp: Stamp,
  width: number,
  height: number,
  at: (x: number, y: number) => Pair
): Polygon {
  return outlineOf(stamp, width, height).map((ring): Ring => ring.map(([x, y]) => at(x, y)))
}

// The picture of a stamp for the library: an SVG path in a box of 100 by 100, the
// outline fitted into it with its own proportions. The holes are cut with the even-odd rule.
export function thumbPath(stamp: Stamp) {
  const wide = stamp.aspect >= 1
  const width = wide ? 100 : 100 * stamp.aspect
  const height = wide ? 100 / stamp.aspect : 100
  const left = (100 - width) / 2
  const top = (100 - height) / 2
  return outlineOf(stamp, width, height)
    .map((ring) =>
      ring.map(([x, y], i) => `${i === 0 ? "M" : "L"}${(left + x * width).toFixed(1)} ${(top + y * height).toFixed(1)}`).join("") + "Z"
    )
    .join("")
}
