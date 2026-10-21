// How long the highlight takes to come and go.
const FADE_MS = 150

export type Mix = { lit: number; dim: number }

export type Hover = {
  set: (id: string | null) => void
  // Whether the highlight is still coming or going.
  fading: () => boolean
  // How lit an entry is (0 to 1: it is the hovered one or next to it) and how far
  // the rest of the graph is dimmed.
  node: (id: string, near: ReadonlyMap<string, ReadonlySet<string>>) => Mix
  // The same for the line between two entries.
  link: (a: string, b: string) => Mix
}

// The hovered entry, and the one hovered before it, so that what lights up and what
// dims can be blended between the two instead of jumping.
export function createHover(): Hover {
  let id: string | null = null
  let previous: string | null = null
  let start = -FADE_MS

  const progress = () => Math.min(1, (performance.now() - start) / FADE_MS)

  function blend(litOf: (of: string | null) => number): Mix {
    const p = progress()
    return {
      lit: litOf(previous) * (1 - p) + litOf(id) * p,
      dim: (previous ? 1 : 0) * (1 - p) + (id ? 1 : 0) * p,
    }
  }

  return {
    set(next) {
      if (next === id) return
      previous = id
      id = next
      start = performance.now()
    },
    fading: () => progress() < 1,
    node: (node, near) =>
      blend((of) => (of !== null && (node === of || near.get(of)?.has(node)) ? 1 : 0)),
    link: (a, b) => blend((of) => (of !== null && (a === of || b === of) ? 1 : 0)),
  }
}
