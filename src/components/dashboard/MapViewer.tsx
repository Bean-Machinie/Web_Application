import { useMemo, useState } from "react"
import { useLocation } from "react-router-dom"
import "leaflet/dist/leaflet.css"
import { FormAlert } from "@/components/auth/FormAlert"
import { useLeafletMap } from "@/hooks/use-leaflet-map"
import { useMapGrid } from "@/hooks/use-map-grid"
import { useMapMarkerLayer } from "@/hooks/use-map-marker-layer"
import { useMapPlacing } from "@/hooks/use-map-placing"
import { useMapMarkerSelection } from "@/hooks/use-map-marker-selection"
import { useMapMarkers } from "@/hooks/use-map-markers"
import { useMapView } from "@/hooks/use-map-view"
import { usePhoneScreen } from "@/hooks/use-phone-screen"
import { useReturnPulse } from "@/hooks/use-return-pulse"
import { readBackTo } from "@/lib/back-link"
import { mapsAbove } from "@/lib/breadcrumbs"
import { toLatLng } from "@/lib/map-geometry"
import { pinPoint } from "@/lib/map-marker-card"
import { rememberReturn } from "@/lib/map-view"
import { cn } from "@/lib/utils"
import { MapEditBar } from "./MapEditBar"
import { MapEditHint } from "./MapEditHint"
import { MapMarkerCard } from "./MapMarkerCard"
import { MapMarkerMenu } from "./MapMarkerMenu"
import { MapPlacingCursor } from "./MapPlacingCursor"
import { MarkerLinkDialog } from "./MarkerLinkDialog"
import { MapMarkerPeek } from "./MapMarkerPeek"
import { MapViewerNavigator } from "./MapViewerNavigator"
import { MapViewerPhoneControls } from "./MapViewerPhoneControls"
import { MapViewerStatusBar } from "./MapViewerStatusBar"

type Props = {
  campaignId: string
  mapId: string
  mapName: string
  image: { url: string; width: number; height: number; maxZoom?: number }
  canManage: boolean
  // Opens the details panel on the right.
  onDetails: () => void
}

// The map filling its space, with smooth pan and zoom, mouse or touch. Everyone can
// click a marker for a preview. A GM adds markers, and switches to editing
// mode to drag them, change what they link to, or remove them.
export function MapViewer({ campaignId, mapId, mapName, image, canManage, onDetails }: Props) {
  const size = useMemo(
    () => ({ width: image.width, height: image.height }),
    [image.width, image.height]
  )
  const { container, map } = useLeafletMap(image.url, size, image.maxZoom)
  const { markers, error, add, move, relink, remove } = useMapMarkers(mapId)
  useMapGrid(map)
  useMapView(map, size, mapId)
  const pulseId = useReturnPulse(mapId)
  const phone = usePhoneScreen()
  const selection = useMapMarkerSelection(map, !phone)
  const { selectedId, clear } = selection
  const { placing, setPlacing, pending, setPending, landed } = useMapPlacing(map, size, clear)
  const editing = canManage && selection.editing
  // Entries opened from this map show it, and the maps above it, in their trail.
  const from = readBackTo(useLocation().state)
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
    pulseId,
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
        // The map takes every touch: the page neither zooms nor scrolls behind it.
        "bg-muted relative isolate flex size-full touch-none flex-col overflow-hidden overscroll-none",
        // The pin that follows the pointer stands in for the cursor.
        placing && "map-placing"
      )}
    >
      {/* What floats over the map is placed on this, so the status bar is under it. */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
      {/* Leaflet adds its own classes here, so this className must never change. */}
      <div ref={container} className="map-canvas size-full" />
      {phone ? (
        <MapViewerPhoneControls map={map} url={image.url} size={size} onDetails={onDetails} />
      ) : (
        <MapViewerNavigator map={map} url={image.url} size={size} onDetails={onDetails} />
      )}
      {map && placing && <MapPlacingCursor map={map} />}
      {editing && <MapEditHint />}
      {phone && selected && !editing && (
        <MapMarkerPeek
          marker={selected}
          canManage={canManage}
          backTo={{ path: `/app/world/${mapId}`, label: mapName, maps: mapsAbove(mapId, from) }}
          onOpen={() => rememberReturn(mapId, selected.id)}
          onClose={clear}
          onRemove={removeSelected}
        />
      )}
      {!phone && map && selected && point && !editing && (
        <MapMarkerCard
          // Each marker's card opens fresh.
          key={selected.id}
          marker={selected}
          point={point}
          mapWidth={map.getSize().x}
          canManage={canManage}
          backTo={{ path: `/app/world/${mapId}`, label: mapName, maps: mapsAbove(mapId, from) }}
          onOpen={() => rememberReturn(mapId, selected.id)}
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
      <MapViewerStatusBar map={map} size={size}>
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
      </MapViewerStatusBar>
    </div>
  )
}
