import { useEffect, useMemo, useState } from "react"
import "leaflet/dist/leaflet.css"
import { FormAlert } from "@/components/auth/FormAlert"
import { useLeafletMap } from "@/hooks/use-leaflet-map"
import { useMapMarkerLayer } from "@/hooks/use-map-marker-layer"
import { useMapMarkers } from "@/hooks/use-map-markers"
import type { MapImageUpload } from "@/hooks/use-map-image-upload"
import { useMapPoint } from "@/hooks/use-map-point"
import { toLatLng, toPercent } from "@/lib/map-geometry"
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
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [placing, setPlacing] = useState(false)
  const [pending, setPending] = useState<Percent | null>(null)

  const list = useMemo(() => markers ?? [], [markers])
  // A hovered marker shows its preview; otherwise the clicked one stays open.
  const shown = list.find((marker) => marker.id === (hoverId ?? selectedId)) ?? null
  const position = useMemo(() => (shown ? toLatLng(shown, size) : null), [shown, size])
  const point = useMapPoint(map, position)
  const message = error ?? upload.error

  useMapMarkerLayer({
    map,
    size,
    markers: list,
    loaded: markers !== null,
    pending,
    selectedId,
    canManage,
    onSelect: setSelectedId,
    onHover: setHoverId,
    onDragStart: () => setSelectedId(null),
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
        {shown && point && (
          <MapMarkerCard
            marker={shown}
            point={point}
            canManage={canManage}
            backTo={{ path: `/app/world/${mapId}`, label: mapName }}
            pinned={shown.id === selectedId}
            onClose={() => setSelectedId(null)}
            onRemove={() => {
              setSelectedId(null)
              remove(shown.id)
            }}
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
