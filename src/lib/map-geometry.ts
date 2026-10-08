import * as L from "leaflet"

export type MapSize = { width: number; height: number }
// Percentages of the image, x from the left and y from the top.
export type Percent = { x: number; y: number }

// The image sits at [0, 0] to [height, width] in Leaflet's flat coordinates,
// where y grows upwards.
export const mapBounds = ({ width, height }: MapSize) =>
  L.latLngBounds([0, 0], [height, width])

const clamp = (value: number) => Math.min(Math.max(value, 0), 100)

export const toLatLng = ({ x, y }: Percent, { width, height }: MapSize) =>
  L.latLng(((100 - y) / 100) * height, (x / 100) * width)

export const toPercent = (position: L.LatLng, { width, height }: MapSize): Percent => ({
  x: clamp((position.lng / width) * 100),
  y: clamp(100 - (position.lat / height) * 100),
})
