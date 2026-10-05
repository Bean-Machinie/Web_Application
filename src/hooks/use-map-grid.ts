import { useEffect } from "react"
import * as L from "leaflet"
import { viewOf } from "@/lib/map-glide"

// Pixels per map unit at zoom 0, which sets how the dots sit on the image.
const UNIT = 1.5
// The pitch of the in-between dots, in pixels, is kept between these: they are
// invisible at the small one and fully there at the large one.
const MIN_PITCH = 12
const MAX_PITCH = 24
// The grid is this many screens wide on each side of the view, so it still
// covers the map while a zoom animation scales it.
const REACH = 2

// A fine dot grid under the map, living in the map's own panes so it pans and
// zooms with it. As the map zooms, dots between the main ones fade in or out,
// so the grid never gets too dense or too sparse.
export function useMapGrid(map: L.Map | null) {
  useEffect(() => {
    if (!map) return
    const pane = map.createPane("grid")
    pane.style.zIndex = "150"
    const grid = L.DomUtil.create("div", "map-grid", pane)
    L.DomUtil.create("div", "map-grid-main", grid)
    L.DomUtil.create("div", "map-grid-extra", grid)

    const update = () => {
      const view = map.getSize()
      const { center, zoom } = viewOf(map)
      // Worked out from the view itself, to the fraction of a pixel, so the
      // dots stay true while the map glides.
      const onScreen = (position: L.LatLngExpression) =>
        map.project(position, zoom).subtract(map.project(center, zoom)).add(view.divideBy(2))
      const top = L.point(-view.x * REACH, -view.y * REACH)
      const corner = top.subtract(L.DomUtil.getPosition(map.getPane("mapPane")!))
      const origin = onScreen([0, 0]).subtract(top)
      const perUnit = UNIT * 2 ** zoom
      const pitch = perUnit * 2 ** Math.ceil(Math.log2(MIN_PITCH / perUnit))
      // The dots sit at the tile's quarter points, so the tile starts half a
      // pitch before the dot that falls on the map's corner.
      const place = (value: number) => `${value - pitch / 2}px`
      L.DomUtil.setPosition(grid, corner)
      grid.style.width = `${view.x * (1 + 2 * REACH)}px`
      grid.style.height = `${view.y * (1 + 2 * REACH)}px`
      grid.style.setProperty("--tile", `${pitch * 2}px`)
      grid.style.setProperty("--x", place(origin.x))
      grid.style.setProperty("--y", place(origin.y))
      grid.style.setProperty(
        "--extra",
        String(Math.min(Math.max((pitch - MIN_PITCH) / (MAX_PITCH - MIN_PITCH), 0), 1))
      )
    }

    update()
    map.on("glide zoom moveend zoomend viewreset resize", update)
    return () => {
      map.off("glide zoom moveend zoomend viewreset resize", update)
      pane.remove()
    }
  }, [map])
}
