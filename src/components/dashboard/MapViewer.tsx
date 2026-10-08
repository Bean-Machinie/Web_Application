import { useEffect, useMemo, useState } from "react"
import { useReducedMotion } from "motion/react"
import "leaflet/dist/leaflet.css"
import { FormAlert } from "@/components/auth/FormAlert"
import { useLeafletMap } from "@/hooks/use-leaflet-map"
import { useMapMarkerLayer } from "@/hooks/use-map-marker-layer"
import { useMapMarkers } from "@/hooks/use-map-markers"
import type { MapImageUpload } from "@/hooks/use-map-image-upload"
import { useMapMarkerCard } from "@/hooks/use-map-marker-card"
import { toPercent } from "@/lib/map-geometry"
import type { Percent } from "@/lib/map-geometry"
import { cn } from "@/lib/utils"
import { MapControls } from "./MapControls"
import { MapEditBar } from "./MapEditBar"
import { MapMarkerCard } from "./MapMarkerCard"
import { MarkerLinkDialog } from "./MarkerLinkDialog"

type Props = {
  campaignId: string
  mapId: string
  mapName: string
  image: { url: string; width: number; height: number }
  canManage: boolean
  upload: MapImageUpload
}

// The map at full width with smooth pan and zoom, mouse or touch. A GM adds,
// drags and removes markers; everyone can click one for a preview.
export function MapViewer({ campaignId, mapId, mapName, image, canManage, upload }: Props) {
  const size = useMemo(
    () => ({ width: image.width, height: image.height }),
    [image.width, image.height]
  )
  const { container, map } = useLeafletMap(image.url, size)
  const { markers, error, add, move, remove } = useMapMarkers(mapId)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [placing, setPlacing] = useState(false)
  const [pending, setPending] = useState<Percent | null>(null)

  const list = useMemo(() => markers ?? [], [markers])
  const card = useMapMarkerCard({ map, markers: list, selectedId, setSelectedId })
  const reduced = useReducedMotion()
  const message = error ?? upload.error

  const grab = useMapMarkerLayer({
    map,
    size,
    markers: list,
    loaded: markers !== null,
    pending,
    selectedId,
    // With reduced motion the card fades in over the pin instead of replacing it.
    hiddenId: reduced ? null : (card.marker?.id ?? null),
    canManage,
    onSelect: setSelectedId,
    onHover: (id) => (id ? card.enter(id) : card.leavePin()),
    onDragStart: card.dismiss,
    onMove: move,
  })

  // A click on the map either places the marker or dismisses the preview.
  useEffect(() => {
    if (!map) return
    const onClick = (event: L.LeafletMouseEvent) => {
      if (placing) {
        setPending(toPercent(event.latlng, size))
        setPlacing(false)
      } else {
        setSelectedId(null)
      }
    }
    map.on("click", onClick)
    return () => {
      map.off("click", onClick)
    }
  }, [map, size, placing])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setPlacing(false)
      setSelectedId(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <div className="flex flex-col gap-3">
      <div
        className={cn(
          "bg-muted relative isolate w-full overflow-hidden rounded-lg border",
          placing && "[&_.leaflet-grab]:cursor-crosshair"
        )}
        style={{ aspectRatio: `${size.width} / ${size.height}`, maxHeight: "75svh" }}
      >
        {/* Leaflet adds its own classes here, so this className must never change. */}
        <div ref={container} className="bg-muted! size-full" />
        <MapControls map={map} size={size} />
        {canManage && (
          <MapEditBar
            placing={placing}
            upload={upload}
            onPlace={() => {
              setSelectedId(null)
              setPlacing(true)
            }}
            onCancel={() => setPlacing(false)}
          />
        )}
        {map && card.marker && (
          <MapMarkerCard
            // Each marker's card starts from its own pin.
            key={card.marker.id}
            marker={card.marker}
            map={map}
            size={size}
            canManage={canManage}
            backTo={{ path: `/app/world/${mapId}`, label: mapName }}
            open={card.open}
            pinned={card.marker.id === selectedId}
            onEnter={() => card.enter(card.marker!.id)}
            onLeave={card.leave}
            onSelect={() => setSelectedId(card.marker!.id)}
            onGrab={(x, y) => grab(card.marker!.id, x, y)}
            onClose={() => setSelectedId(null)}
            onRemove={() => {
              setSelectedId(null)
              remove(card.marker!.id)
            }}
            onDone={card.done}
          />
        )}
      </div>
      {message && <FormAlert tone="error">{message}</FormAlert>}
      <MarkerLinkDialog
        open={pending !== null}
        campaignId={campaignId}
        mapId={mapId}
        onClose={() => setPending(null)}
        onLink={async (entryId) => {
          await add(entryId, pending!.x, pending!.y)
          setPending(null)
        }}
      />
    </div>
  )
}
