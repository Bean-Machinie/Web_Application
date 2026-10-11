// Where the shape being placed was, at each step of its being edited: how its box
// was set (its middle, size, scale and turn). The creation is the first, so going back
// past it takes the shape away, and forward again brings it back. It lives only
// while the shape is being placed; once it is applied, undo is the map's own.
export type Pose = {
  x: number
  y: number
  width: number
  height: number
  offsetX: number
  offsetY: number
  scaleX: number
  scaleY: number
  rotation: number
}

const same = (a: Pose, b: Pose) => (Object.keys(a) as (keyof Pose)[]).every((key) => Math.abs(a[key] - b[key]) < 1e-6)

export function createTrail() {
  let poses: Pose[] = []
  // The step the shape is at; -1 is before its creation, with it taken away.
  let at = -1

  return {
    // A shape was created.
    start(pose: Pose) {
      poses = [pose]
      at = 0
    },
    // An edit was made: the steps ahead of the shape, if it had gone back, are lost.
    // Says whether it was a change.
    push(pose: Pose) {
      if (at < 0 || same(poses[at], pose)) return false
      poses = [...poses.slice(0, at + 1), pose]
      at++
      return true
    },
    // The pose to go back to, null if the shape goes, or undefined if there is no step back.
    undo(): Pose | null | undefined {
      if (at < 0) return undefined
      at--
      return at < 0 ? null : poses[at]
    },
    redo(): Pose | undefined {
      if (at + 1 >= poses.length) return undefined
      at++
      return poses[at]
    },
    clear() {
      poses = []
      at = -1
    },
    canUndo: () => at >= 0,
    canRedo: () => at + 1 < poses.length,
  }
}
