// The entry and everything within `depth` steps of it, along the lines of the graph.
export function withinSteps(
  near: ReadonlyMap<string, ReadonlySet<string>>,
  start: string,
  depth: number
): Set<string> {
  const reached = new Set([start])
  let edge = [start]
  for (let step = 0; step < depth; step += 1) {
    const next: string[] = []
    for (const id of edge) {
      for (const other of near.get(id) ?? []) {
        if (reached.has(other)) continue
        reached.add(other)
        next.push(other)
      }
    }
    edge = next
  }
  return reached
}
