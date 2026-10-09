// What the viewer calls a zoom. The whole map in view is 100% and the closest the map
// goes is 400%, on every map and every screen, however many zoom levels that is.
// Between them it is even in ratios, as the zoom itself is.
const CLOSEST = 4

type Range = { min: number; max: number }

export function zoomToPercent(zoom: number, { min, max }: Range) {
  if (max <= min) return 100
  const share = Math.min(Math.max((zoom - min) / (max - min), 0), 1)
  return Math.round(100 * CLOSEST ** share)
}

export function percentToZoom(percent: number, { min, max }: Range) {
  if (max <= min) return min
  const share = Math.log(Math.min(Math.max(percent / 100, 1), CLOSEST)) / Math.log(CLOSEST)
  return min + share * (max - min)
}
