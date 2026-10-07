import type { SceneBackground } from "./map-scene"

// What the land looks like depends on what it sits on. These are art, so fixed
// colours.
export const LAND_COLOURS: Record<SceneBackground, { fill: string; ink: string }> = {
  parchment: { fill: "#efe3bd", ink: "#5b4128" },
  ocean: { fill: "#c6d193", ink: "#4a572d" },
}
