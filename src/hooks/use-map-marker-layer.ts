import { useEffect, useRef } from "react"
import * as L from "leaflet"
import { pendingIcon, pinIcon } from "@/components/dashboard/map-pin-icon"
import { toLatLng, toPercent } from "@/lib/map-geometry"
import type { MapSize, Percent } from "@/lib/map-geometry"
import type { MapMarker } from "@/lib/world-map-markers"

type Options = {
  map: L.Map | null
  size: MapSize
  markers: MapMarker[]
  // False until the first load has come back; markers present by then do not
  // pop in, only ones added afterwards.
  loaded: boolean
  // Where a marker is about to be placed, drawn as a ghost.
  pending: Percent | null
  selectedId: string | null
  // A GM moving markers: they can be dragged and carry no name label.
  editing: boolean
  onSelect: (id: string) => void
  onDragStart: () => void
  onMove: (id: string, x: number, y: number) => void
}

// Leaflet would put the name into the page as markup, so it goes in as text.
function label(name: string) {
  const element = document.createElement("span")
  element.textContent = name
  return element
}

// Keeps Leaflet's markers in step with the list: added, moved, restyled and
// removed as it changes. While editing they can be dragged; otherwise they
// show their name on hover. The map and its image are never touched here.
export function useMapMarkerLayer(options: Options) {
  const { map, size, markers, loaded, pending, selectedId, editing } = options
  const layers = useRef(new Map<string, L.Marker>())
  const known = useRef<Set<string> | null>(null)
  const latest = useRef(options)
  useEffect(() => {
    latest.current = options
  })

  // A new map starts with no markers; the old map took its own down.
  useEffect(() => {
    const live = layers.current
    return () => {
      live.clear()
      known.current = null
    }
  }, [map])

  useEffect(() => {
    if (!map || !loaded) return
    const live = layers.current
    known.current ??= new Set(markers.map((marker) => marker.id))
    const seen = known.current

    const present = new Set(markers.map((marker) => marker.id))
    for (const [id, layer] of live) {
      if (!present.has(id)) {
        layer.remove()
        live.delete(id)
      }
    }

    for (const marker of markers) {
      const position = toLatLng(marker, size)
      let layer = live.get(marker.id)
      const selected = marker.id === selectedId
      if (layer) {
        layer.setLatLng(position)
        layer.setIcon(pinIcon(marker, selected, false, editing))
      } else {
        const pop = !seen.has(marker.id)
        seen.add(marker.id)
        const created = L.marker(position, {
          icon: pinIcon(marker, selected, pop, editing),
          draggable: editing,
          riseOnHover: true,
        }).addTo(map)
        // A click can follow the end of a drag; it is not a selection.
        let dragged = false
        created.on("click", () => {
          if (!dragged) latest.current.onSelect(marker.id)
        })
        created.on("dragstart", () => {
          dragged = true
          latest.current.onDragStart()
        })
        created.on("dragend", () => {
          const { x, y } = toPercent(created.getLatLng(), latest.current.size)
          latest.current.onMove(marker.id, x, y)
          setTimeout(() => {
            dragged = false
          })
        })
        live.set(marker.id, created)
        layer = created
      }
      if (editing) layer.dragging?.enable()
      else layer.dragging?.disable()

      // The label would sit under an open card, and is not wanted when editing.
      layer.unbindTooltip()
      if (!editing && !selected) {
        layer.bindTooltip(label(marker.name), { direction: "top", className: "map-label", opacity: 1 })
      }
    }
  }, [map, size, markers, loaded, selectedId, editing])

  useEffect(() => {
    if (!map || !pending) return
    const ghost = L.marker(toLatLng(pending, size), {
      icon: pendingIcon(),
      interactive: false,
    }).addTo(map)
    return () => {
      ghost.remove()
    }
  }, [map, size, pending])
}
