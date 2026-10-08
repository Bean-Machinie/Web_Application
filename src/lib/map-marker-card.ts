import type * as L from "leaflet"

export const CARD_WIDTH = 288
// The resting pin: a 40 px circle whose bottom sits this far above the tip.
export const PIN_CIRCLE = 40
export const PIN_LIFT = 6
export const PIN_HEIGHT = 46

const MARGIN = 8
// Closer to the top than this, the card opens downward.
const FLIP_BELOW = 230

// Soft spring of about a quarter second.
export const SPRING = { type: "spring", visualDuration: 0.25, bounce: 0.12 } as const

// Rounded the way Leaflet rounds the pin, so the card starts exactly on it.
export function pinPoint(map: L.Map, position: L.LatLng) {
  const { x, y } = map.latLngToContainerPoint(position)
  return { x: Math.round(x), y: Math.round(y) }
}

// Where the card goes relative to the pin's tip: centred on it, pushed back
// inside the map near a side edge, and flipped below near the top.
export function placeCard(point: { x: number; y: number }, mapSize: { x: number }) {
  const left = Math.max(MARGIN, Math.min(point.x - CARD_WIDTH / 2, mapSize.x - CARD_WIDTH - MARGIN))
  return { left: left - point.x, below: point.y < FLIP_BELOW }
}
