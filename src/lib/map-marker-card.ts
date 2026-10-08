import type * as L from "leaflet"

export const CARD_WIDTH = 288
// How far the card's edge sits from the pin's tip. Above, that clears the pin
// when it is lifted; below, it sits just under the tip.
export const CARD_ABOVE = 62
export const CARD_BELOW = 10

const MARGIN = 8
// Closer to the top than this, the card opens downward.
const FLIP_BELOW = 230

// Rounded the way Leaflet rounds the pin, so the card lines up with it.
export function pinPoint(map: L.Map, position: L.LatLng) {
  const { x, y } = map.latLngToContainerPoint(position)
  return { x: Math.round(x), y: Math.round(y) }
}

// Where the card goes relative to the pin's tip: centred on it, pushed back
// inside the map near a side edge, and flipped below near the top.
export function placeCard(point: { x: number; y: number }, mapWidth: number) {
  const left = Math.max(MARGIN, Math.min(point.x - CARD_WIDTH / 2, mapWidth - CARD_WIDTH - MARGIN))
  return { left: left - point.x, below: point.y < FLIP_BELOW }
}
