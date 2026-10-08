import { useMemo, useState } from "react"
import "leaflet/dist/leaflet.css"
import { FormAlert } from "@/components/auth/FormAlert"
import { useLeafletMap } from "@/hooks/use-leaflet-map"
import { useMapMarkerLayer } from "@/hooks/use-map-marker-layer"
import { useMapPlacing } from "@/hooks/use-map-placing"
import { useMapMarkerSelection } from "@/hooks/use-map-marker-selection"
import { useMapMarkers } from "@/hooks/use-map-markers"
import { toLatLng } from "@/lib/map-geometry"
import { pinPoint } from "@/lib/map-marker-card"
import { cn } from "@/lib/utils"
import { MapControls } from "./MapControls"
import { MapEditBar } from "./MapEditBar"
import { MapEditHint } from "./MapEditHint"
import { MapMarkerCard } from "./MapMarkerCard"
import { MapMarkerMenu } from "./MapMarkerMenu"
import { MapPlacingCursor } from "./MapPlacingCursor"
import { MarkerLinkDialog } from "./MarkerLinkDialog"

type Props = {
  campaignId: string
  mapId: string
  mapName: string
  image: { url: string; width: number; height: number }
  canManage: boolean
}

// The map filling its space, with smooth pan and zoom, mouse or touch. Everyone can
// click a marker for a preview. A GM adds markers, and switches to editing
// mode to drag them, change what they link to, or remove them.
export function MapViewer({ campaignId, mapId, mapName, image, canManage }: Props) {
  const size = useMemo(
    () => ({ width: image.width, height: image.height }),
    [image.width, image.height]
  )
  const { container, map } = useLeafletMap(image.url, size)
  const { markers, error, add, move, relink, remove } = useMapMarkers(mapId)
  const selection = useMapMarkerSelection(map)
  const { selectedId, clear } = selection
  const { placing, setPlacing, pending, setPending, landed } = useMapPlacing(map, size, clear)
  const editing = canManage && selection.editing
  const [relinkId, setRelinkId] = useState<string | null>(null)

  const list = useMemo(() => markers ?? [], [markers])
  const selected = list.find((marker) => marker.id === selectedId) ?? null
  // Where the open marker's pin is. Any pan or zoom closes it, so it never
  // needs to follow.
  const point = useMemo(
    () => (map && selected ? pinPoint(map, toLatLng(selected, size)) : null),
    [map, selected, size]
  )

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

  const removeSelected = () => {
    if (!selected) return
    clear()
    remove(selected.id)
  }

  return (
    <div
      className={cn(
        "bg-muted relative isolate size-full overflow-hidden",
        // The pin that follows the pointer stands in for the cursor.
        placing && "map-placing"
      )}
    >
      {/* Leaflet adds its own classes here, so this className must never change. */}
      <div ref={container} className="bg-muted! size-full" />
      <MapControls map={map} size={size} />
      {canManage && (
        <MapEditBar
          placing={placing}
          editing={editing}
          onPlace={() => {
            clear()
            setPlacing(true)
          }}
          onCancel={() => setPlacing(false)}
          onToggleEditing={selection.toggleEditing}
        />
      )}
      {map && placing && <MapPlacingCursor map={map} />}
      {editing && <MapEditHint />}
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
      {error && (
        <div className="absolute top-3 left-1/2 z-[1000] w-[min(28rem,calc(100%-2rem))] -translate-x-1/2">
          <FormAlert tone="error">{error}</FormAlert>
        </div>
      )}
      <MarkerLinkDialog
        open={landed || relinkId !== null}
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
