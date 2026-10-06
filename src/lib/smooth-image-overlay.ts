import * as L from "leaflet"

// Leaflet rounds an image's corners to whole pixels whenever it lays them out,
// which makes the map snap by a pixel or two the moment a glide hands over.
// This one is laid out to the fraction, as the glide has it.
export class SmoothImageOverlay extends L.ImageOverlay {
  _reset() {
    const image = this.getElement()
    const map = (this as unknown as { _map: L.Map })._map
    if (!image || !map) return
    const corner = (point: L.LatLng) => map.project(point)
    const min = corner(this.getBounds().getNorthWest())
    const size = corner(this.getBounds().getSouthEast()).subtract(min)
    L.DomUtil.setPosition(image, min.subtract(map.getPixelOrigin()))
    image.style.width = `${size.x}px`
    image.style.height = `${size.y}px`
  }
}
