import type * as L from "leaflet"

// Leaflet would put the name into the page as markup, so it goes in as text.
export function label(name: string) {
  const element = document.createElement("span")
  element.textContent = name
  return element
}

// Squashes the pin into the map and sends a ripple out; see MapPin and index.css.
export function plant(icon: HTMLElement | undefined) {
  if (!icon) return
  icon.classList.add("pin-planted")
  setTimeout(() => icon.classList.remove("pin-planted"), 600)
}

// A pin with its card open stays lifted, and drops back when it closes. This is
// a class rather than a new icon, so the drop can animate.
export function setLifted(layer: L.Marker, lifted: boolean) {
  const icon = layer.getElement()
  if (!icon) return
  const was = icon.classList.contains("pin-selected")
  icon.classList.toggle("pin-selected", lifted)
  if (was && !lifted) plant(icon)
}
