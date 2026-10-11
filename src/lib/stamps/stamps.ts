import type { Ring } from "polygon-clipping"

// The outline of a stamp, as rings in a box of 0 to 1 each way: the outer ring first, and
// any holes after it. A round shape is made for the size it is drawn at, so that it
// has as many points as that size wants (see basic-shapes.ts).
export type StampRings = Ring[] | ((width: number, height: number) => Ring[])

export type Stamp = {
  id: string
  name: string
  group: "basic" | "islands"
  // How wide it is for each unit of height as it was made, which Shift keeps.
  aspect: number
  rings: StampRings
}

// What is kept of an island, in stamps.json.
export type SavedStamp = { id: string; name: string; aspect: number; rings: Ring[] }

export const outlineOf = (stamp: Stamp, width: number, height: number): Ring[] =>
  typeof stamp.rings === "function" ? stamp.rings(width, height) : stamp.rings
