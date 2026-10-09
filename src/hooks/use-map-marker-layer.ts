import { useEffect, useRef } from "react"
import * as L from "leaflet"
import { pendingIcon, pinIcon } from "@/components/dashboard/map-pin-icon"
import { useMapZoomLevel } from "@/hooks/use-map-zoom-level"
import { label, plant, setLifted } from "@/lib/map-pin-effects"
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
  // A marker to point out, pulsing once when the map opens.
  pulseId: string | null
  onSelect: (id: string) => void
  onDragStart: () => void
  onMove: (id: string, x: number, y: number) => void
}

// Keeps Leaflet's markers in step with the list: added, moved, restyled and
// removed as it changes. While editing they can be dragged; otherwise they
// show their name on hover. The map and its image are never touched here.
export function useMapMarkerLayer(options: Options) {
  const { map, size, markers, loaded, pending, selectedId, editing, pulseId } = options
  const layers = useRef(new Map<string, L.Marker>())
  const known = useRef<Set<string> | null>(null)
  // How each icon was last drawn. An icon is only rebuilt when that changes, so
  // a pin let go of keeps its element, and its planting animation, when its new
  // place comes back from the list.
  const looks = useRef(new Map<string, string>())
  const pulsed = useRef<string | null>(null)
  const latest = useRef(options)
  useEffect(() => {
    latest.current = options
  })

  useMapZoomLevel(map, editing)

  // A new map starts with no markers; the old map took its own down.
  useEffect(() => {
    const live = layers.current
    const drawn = looks.current
    return () => {
      live.clear()
      drawn.clear()
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
        looks.current.delete(id)
      }
    }

    const previous = new Map(looks.current)
    for (const marker of markers) {
      const position = toLatLng(marker, size)
      let layer = live.get(marker.id)
      const selected = marker.id === selectedId
      const look = [marker.imageUrl, marker.kind, marker.name, marker.revealed, editing].join("|")
      looks.current.set(marker.id, look)
      if (layer) {
        layer.setLatLng(position)
        if (look !== previous.get(marker.id)) {
          layer.setIcon(pinIcon(marker, false, editing))
        }
      } else {
        const pop = !seen.has(marker.id)
        seen.add(marker.id)
        const created = L.marker(position, {
          icon: pinIcon(marker, pop, editing),
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
          plant(created.getElement())
          setTimeout(() => {
            dragged = false
          }, 600)
        })
        // Leaving a hovered pin drops it with a bounce, unless it is held up.
        created.on("mouseout", () => {
          const icon = created.getElement()
          if (!latest.current.editing && !icon?.classList.contains("pin-selected")) plant(icon)
        })
        live.set(marker.id, created)
        layer = created
      }
      setLifted(layer, selected && !editing)
      if (editing) layer.dragging?.enable()
      else layer.dragging?.disable()

      // The label would sit under an open card, and is not wanted when editing.
      layer.unbindTooltip()
      if (!editing && !selected) {
        layer.bindTooltip(label(marker.name), { direction: "top", className: "map-label", opacity: 1 })
      }
    }
  }, [map, size, markers, loaded, selectedId, editing])

  // Once, when the marker is there to pulse. The class does the animating; see
  // MapPin and index.css.
  useEffect(() => {
    if (!pulseId || !loaded || pulsed.current === pulseId) return
    const icon = layers.current.get(pulseId)?.getElement()
    if (!icon) return
    pulsed.current = pulseId
    icon.classList.add("pin-find")
    setTimeout(() => icon.classList.remove("pin-find"), 3000)
  }, [pulseId, loaded, markers])

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
