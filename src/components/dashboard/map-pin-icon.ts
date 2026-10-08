import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import * as L from "leaflet"
import { WORLD_KINDS } from "@/lib/world-kinds"
import type { MapMarker } from "@/lib/world-map-markers"
import { MapPendingPin } from "./MapPendingPin"
import { MapPin } from "./MapPin"

// The pin is 40 px wide; its tip is at the bottom centre.
const SIZE: L.PointExpression = [40, 46]
const ANCHOR: L.PointExpression = [20, 46]

export const pinIcon = (marker: MapMarker, selected: boolean) =>
  L.divIcon({
    className: "",
    iconSize: SIZE,
    iconAnchor: ANCHOR,
    html: renderToStaticMarkup(
      createElement(MapPin, {
        imageUrl: marker.imageUrl,
        Icon: WORLD_KINDS[marker.kind].icon,
        revealed: marker.revealed,
        selected,
      })
    ),
  })

export const pendingIcon = () =>
  L.divIcon({
    className: "",
    iconSize: SIZE,
    iconAnchor: ANCHOR,
    html: renderToStaticMarkup(createElement(MapPendingPin)),
  })
