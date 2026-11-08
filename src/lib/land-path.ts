import { GRID } from "./land-grid"
import type { LandGrid } from "./land-grid"

// How much dearer a step right by the water is than one far inland.
const SHORE_COST = 4

// A binary heap of cells, cheapest first.
function heap() {
  const items: [number, number][] = []
  const push = (cost: number, cell: number) => {
    items.push([cost, cell])
    for (let i = items.length - 1; i > 0; ) {
      const parent = (i - 1) >> 1
      if (items[parent][0] <= items[i][0]) break
      ;[items[parent], items[i]] = [items[i], items[parent]]
      i = parent
    }
  }
  const pop = () => {
    const top = items[0]
    const last = items.pop()!
    if (items.length > 0) {
      items[0] = last
      for (let i = 0; ; ) {
        const [l, r] = [i * 2 + 1, i * 2 + 2]
        let least = i
        if (l < items.length && items[l][0] < items[least][0]) least = l
        if (r < items.length && items[r][0] < items[least][0]) least = r
        if (least === i) break
        ;[items[least], items[i]] = [items[i], items[least]]
        i = least
      }
    }
    return top[1]
  }
  return { push, pop, size: () => items.length }
}

const distance = (a: number, b: number) => Math.hypot((a % GRID) - (b % GRID), Math.floor(a / GRID) - Math.floor(b / GRID))

// The cheapest way over land from one cell to another (A*, in eight directions), each step costing
// more the nearer it runs to water; null when the land does not join them.
export function landPath({ land, shore }: LandGrid, start: number, end: number): number[] | null {
  const cost = new Float32Array(land.length).fill(Infinity)
  const from = new Int32Array(land.length).fill(-1)
  const open = heap()
  cost[start] = 0
  open.push(distance(start, end), start)
  while (open.size() > 0) {
    const cell = open.pop()
    if (cell === end) break
    const [x, y] = [cell % GRID, Math.floor(cell / GRID)]
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const [nx, ny] = [x + dx, y + dy]
        if ((!dx && !dy) || nx < 0 || ny < 0 || nx >= GRID || ny >= GRID) continue
        const next = ny * GRID + nx
        if (!land[next]) continue
        const step = Math.hypot(dx, dy) * (1 + SHORE_COST / (1 + shore[next]))
        if (cost[cell] + step >= cost[next]) continue
        cost[next] = cost[cell] + step
        from[next] = cell
        open.push(cost[next] + distance(next, end), next)
      }
    }
  }
  if (from[end] === -1 && start !== end) return null
  const path = [end]
  while (path[path.length - 1] !== start) path.push(from[path[path.length - 1]])
  return path.reverse()
}
