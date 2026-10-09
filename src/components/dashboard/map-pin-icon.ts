import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { Layers } from "lucide-react"
import * as L from "leaflet"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { MapMarker } from "@/lib/world-map-markers"
import { MapPendingPin } from "./MapPendingPin"
import { MapPin } from "./MapPin"

// The pin is 40 px wide; its tip is at the bottom centre.
const SIZE: L.PointExpression = [40, 46]
const ANCHOR: L.PointExpression = [20, 46]
// "group/pin" lets the pin react to hover; "map-pin" strips Leaflet's box (see
// index.css).
const CLASS = "group/pin map-pin"
// Above the lifted pin, where the name label opens.
const LABEL: L.PointExpression = [0, -52]

export const pinIcon = (marker: MapMarker, pop: boolean, editing: boolean) => {
  const kind = WORLD_KINDS[marker.kind]
  const isMap = marker.kind === "map"
  return L.divIcon({
    className: editing ? `${CLASS} map-pin-edit` : CLASS,
    iconSize: SIZE,
    iconAnchor: ANCHOR,
    tooltipAnchor: LABEL,
    html: renderToStaticMarkup(
      createElement(MapPin, {
        imageUrl: marker.imageUrl,
        // A stack of layers marks a marker that opens another map.
        Icon: isMap ? Layers : kind.icon,
        tint: kind.tint,
        name: marker.name,
        isMap,
        revealed: marker.revealed,
        pop,
        editing,
      })
    ),
  })
}

export const pendingIcon = () =>
  L.divIcon({
    className: "",
    iconSize: SIZE,
    iconAnchor: ANCHOR,
    html: renderToStaticMarkup(createElement(MapPendingPin, { drop: true })),
  })
