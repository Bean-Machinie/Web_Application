import type * as L from "leaflet"
import { toLatLng, toPercent } from "./map-geometry"
import type { MapSize, Percent } from "./map-geometry"

// Where a map is looking: the centre as a share of the image, and how far in,
// counted from fully zoomed out. Neither depends on the window's size or the
// image's resolution, so a shared link or a replaced map frames the same.
export type MapView = Percent & { zoom: number }

const round = (value: number, places: number) => {
  const scale = 10 ** places
  return Math.round(value * scale) / scale
}

// "x,y,zoom" for the URL, like the view in a Google Maps link.
export function encodeView(map: L.Map, size: MapSize) {
  const { x, y } = toPercent(map.getCenter(), size)
  return `${round(x, 2)},${round(y, 2)},${round(map.getZoom() - map.getMinZoom(), 2)}`
}

export function parseView(text: string | null): MapView | null {
  const parts = text?.split(",").map(Number)
  if (!parts || parts.length !== 3 || parts.some((part) => !Number.isFinite(part))) return null
  return { x: parts[0], y: parts[1], zoom: Math.max(parts[2], 0) }
}

export function applyView(map: L.Map, size: MapSize, view: MapView) {
  map.setView(toLatLng(view, size), map.getMinZoom() + view.zoom, { animate: false })
}

// What is kept for the browser session, so reopening a map from anywhere finds
// it as it was left.
const viewKey = (mapId: string) => `map-view:${mapId}`
const returnKey = (mapId: string) => `map-return:${mapId}`

function read(key: string) {
  try {
    return sessionStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key)
    else sessionStorage.setItem(key, value)
  } catch {
    // Remembering is a nicety; without storage the map just starts zoomed out.
  }
}

export const recallView = (mapId: string) => read(viewKey(mapId))
export const rememberView = (mapId: string, text: string) => write(viewKey(mapId), text)

// The marker someone left a map through, so coming back can point it out.
export const rememberReturn = (mapId: string, markerId: string) =>
  write(returnKey(mapId), markerId)
export const recallReturn = (mapId: string) => read(returnKey(mapId))
export const forgetReturn = (mapId: string) => write(returnKey(mapId), null)
