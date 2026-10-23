import type { GraphNode } from "@/lib/world-graph"
import type { WorldEntryKind } from "@/lib/world-kinds"
import type { GraphTone } from "./graph-tone"

// The time constant of every fade: a change is about done after three of them, so
// about 150 ms.
const TAU_MS = 50
const SNAP = 0.005

// How an entry is drawn right now, each part between 0 and 1.
export type Look = {
  // Hovered or next to the hovered entry.
  lit: number
  // The hovered entry itself.
  core: number
  alpha: number
  // Selected.
  pick: number
  // A search hit.
  match: number
}

export type Aim = {
  hover: string | null
  selected: string | null
  focus: ReadonlySet<string> | null
  matches: ReadonlySet<string> | null
  hiddenKinds: ReadonlySet<WorldEntryKind>
}

type Near = ReadonlyMap<string, ReadonlySet<string>>

const PLAIN: Look = { lit: 0, core: 0, alpha: 1, pick: 0, match: 0 }
const PARTS = ["lit", "core", "alpha", "pick", "match"] as const

function aimAt(aim: Aim, node: GraphNode, near: Near, tone: GraphTone, out: Look) {
  const core = aim.hover === node.id
  const lit = core || (aim.hover !== null && !!near.get(aim.hover)?.has(node.id))
  let alpha = 1
  if (aim.hiddenKinds.has(node.entry.kind)) alpha = 0
  else if (!core) {
    if (aim.focus && !aim.focus.has(node.id)) alpha = tone.outOfFocus
    if (aim.hover !== null && !lit) alpha = Math.min(alpha, tone.dimmed)
    if (aim.matches && !aim.matches.has(node.id)) alpha = Math.min(alpha, tone.dimmed)
  }
  out.lit = lit ? 1 : 0
  out.core = core ? 1 : 0
  out.alpha = alpha
  out.pick = aim.selected === node.id ? 1 : 0
  out.match = aim.matches?.has(node.id) ? 1 : 0
}

// Moves a look toward its goal; true while it is still on the way.
function approach(look: Look, goal: Look, k: number) {
  let moving = false
  for (const part of PARTS) {
    const gap = goal[part] - look[part]
    if (Math.abs(gap) < SNAP) {
      look[part] = goal[part]
    } else {
      look[part] += gap * k
      moving = true
    }
  }
  return moving
}

// What the graph emphasises (hover, selection, focus, search hits, hidden kinds) and
// how far each entry has faded toward it. It lives outside React, so a frame of a
// fade changes no state: the canvas asks for the looks while it draws, and `step`,
// run once before each frame, moves them on.
export function createEmphasis() {
  const aim: Aim = { hover: null, selected: null, focus: null, matches: null, hiddenKinds: new Set() }
  const looks = new Map<string, Look>()
  const goal: Look = { ...PLAIN }
  const link = { lit: 0, alpha: 1 }
  // How far the graph is dimmed by a hover, for the lines.
  let veil = 0
  // Set by each step, from the theme.
  let dimmed = 1
  let last = 0
  let moving = false

  const look = (id: string) => looks.get(id) ?? PLAIN

  return {
    aim(patch: Partial<Aim>) {
      Object.assign(aim, patch)
      if (!moving) last = performance.now()
      moving = true
    },
    animating: () => moving,
    step(nodes: readonly GraphNode[], near: Near, time: number, tone: GraphTone) {
      dimmed = tone.dimmed
      const k = 1 - Math.exp(-Math.min(time - last, 64) / TAU_MS)
      last = time
      let still = false
      for (const node of nodes) {
        aimAt(aim, node, near, tone, goal)
        const current = looks.get(node.id)
        if (!current) looks.set(node.id, { ...goal })
        else if (approach(current, goal, k)) still = true
      }
      const gap = (aim.hover === null ? 0 : 1) - veil
      if (Math.abs(gap) < SNAP) veil += gap
      else {
        veil += gap * k
        still = true
      }
      moving = still
    },
    look,
    // The same object every time: read it before asking again.
    link(a: string, b: string) {
      const from = look(a)
      const to = look(b)
      link.lit = Math.max(from.core, to.core)
      link.alpha = Math.min(from.alpha, to.alpha, 1 - veil * (1 - dimmed) * (1 - link.lit))
      return link
    },
  }
}

export type Emphasis = ReturnType<typeof createEmphasis>
