import { useEffect, useMemo, useState } from "react"
import "leaflet/dist/leaflet.css"
import { FormAlert } from "@/components/auth/FormAlert"
import { useLeafletMap } from "@/hooks/use-leaflet-map"
import { useMapMarkerLayer } from "@/hooks/use-map-marker-layer"
import { useMapMarkerSelection } from "@/hooks/use-map-marker-selection"
import { useMapMarkers } from "@/hooks/use-map-markers"
import type { MapImageUpload } from "@/hooks/use-map-image-upload"
import { toLatLng, toPercent } from "@/lib/map-geometry"
import type { Percent } from "@/lib/map-geometry"
import { pinPoint } from "@/lib/map-marker-card"
import { cn } from "@/lib/utils"
import { MapControls } from "./MapControls"
import { MapEditBar } from "./MapEditBar"
import { MapMarkerCard } from "./MapMarkerCard"
import { MapMarkerMenu } from "./MapMarkerMenu"
import { MarkerLinkDialog } from "./MarkerLinkDialog"

type Props = {
  campaignId: string
  mapId: string
  mapName: string
  image: { url: string; width: number; height: number }
  canManage: boolean
  upload: MapImageUpload
}

// The map at full width with smooth pan and zoom, mouse or touch. Everyone can
// click a marker for a preview. A GM adds markers, and switches to editing
// mode to drag them, change what they link to, or remove them.
export function MapViewer({ campaignId, mapId, mapName, image, canManage, upload }: Props) {
  const size = useMemo(
    () => ({ width: image.width, height: image.height }),
    [image.width, image.height]
  )
  const { container, map } = useLeafletMap(image.url, size)
  const { markers, error, add, move, relink, remove } = useMapMarkers(mapId)
  const selection = useMapMarkerSelection(map)
  const { selectedId, clear } = selection
  const editing = canManage && selection.editing
  const [placing, setPlacing] = useState(false)
  const [pending, setPending] = useState<Percent | null>(null)
  const [relinkId, setRelinkId] = useState<string | null>(null)

  const list = useMemo(() => markers ?? [], [markers])
  const selected = list.find((marker) => marker.id === selectedId) ?? null
  // Where the open marker's pin is. Any pan or zoom closes it, so it never
  // needs to follow.
  const point = useMemo(
    () => (map && selected ? pinPoint(map, toLatLng(selected, size)) : null),
    [map, selected, size]
  )
  const message = error ?? upload.error

  useMapMarkerLayer({
    map,
    size,
    markers: list,
    loaded: markers !== null,
    pending,
    selectedId,
    editing,
    onSelect: selection.select,
    onDragStart: clear,
    onMove: move,
  })

  // A click on the map either places the marker or closes the open one.
  useEffect(() => {
    if (!map) return
    const onClick = (event: L.LeafletMouseEvent) => {
      if (placing) {
        setPending(toPercent(event.latlng, size))
        setPlacing(false)
      } else {
        clear()
      }
    }
    map.on("click", onClick)
    return () => {
      map.off("click", onClick)
    }
  }, [map, size, placing, clear])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPlacing(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const removeSelected = () => {
    if (!selected) return
    clear()
    remove(selected.id)
  }

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
            editing={editing}
            upload={upload}
            onPlace={() => {
              clear()
              setPlacing(true)
            }}
            onCancel={() => setPlacing(false)}
            onToggleEditing={selection.toggleEditing}
          />
        )}
        {map && selected && point && !editing && (
          <MapMarkerCard
            // Each marker's card opens fresh.
            key={selected.id}
            marker={selected}
            point={point}
            mapWidth={map.getSize().x}
            canManage={canManage}
            backTo={{ path: `/app/world/${mapId}`, label: mapName }}
            onClose={clear}
            onRemove={removeSelected}
          />
        )}
        {selected && point && editing && (
          <MapMarkerMenu
            key={selected.id}
            point={point}
            onChangeLink={() => setRelinkId(selected.id)}
            onRemove={removeSelected}
            onClose={clear}
          />
        )}
      </div>
      {message && <FormAlert tone="error">{message}</FormAlert>}
      <MarkerLinkDialog
        open={pending !== null || relinkId !== null}
        campaignId={campaignId}
        mapId={mapId}
        onClose={() => {
          setPending(null)
          setRelinkId(null)
        }}
        onLink={async (entryId) => {
          if (relinkId) await relink(relinkId, entryId)
          else await add(entryId, pending!.x, pending!.y)
          setPending(null)
          setRelinkId(null)
        }}
      />
    </div>
  )
}
