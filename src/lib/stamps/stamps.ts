import type { MultiPolygon, Polygon, Ring } from "polygon-clipping"

// The outline of a stamp, as polygons in a box of 0 to 1 each way: each the outer ring first,
// and any holes after it. A group of islands is several polygons. A round shape is made for
// the size it is drawn at, so that it has as many points as that size wants (see basic-shapes.ts).
export type StampPolygons = MultiPolygon | ((width: number, height: number) => MultiPolygon)

export type Stamp = {
  id: string
  name: string
  group: "basic" | "islands"
  // How wide it is for each unit of height as it was made, which Shift keeps.
  aspect: number
  polygons: StampPolygons
  // Whether it has corners that can be rounded to a radius, and are then kept as they are.
  corners?: boolean
}

// What is kept of an island, or of a group of them, in stamps.json. A stamp saved when
// stamps were one landmass has its "rings" (the one polygon's) in place of "polygons".
export type SavedStamp = { id: string; name: string; aspect: number; polygons?: Polygon[]; rings?: Ring[] }

export const polygonsOf = (saved: SavedStamp): Polygon[] => saved.polygons ?? (saved.rings ? [saved.rings] : [])

export const outlineOf = (stamp: Stamp, width: number, height: number): MultiPolygon =>
  typeof stamp.polygons === "function" ? stamp.polygons(width, height) : stamp.polygons
