// TEMP-TIMING: shared clock and sampling profiler for the lag investigation. Delete with the other marks.
export const T = { t0: 0, dragging: false }
export const at = () => `+${(performance.now() - T.t0).toFixed(0)}ms${T.dragging ? " DRAG" : ""}`

const tasks: { start: number; duration: number }[] = []
new PerformanceObserver((list) =>
  list.getEntries().forEach((e) => {
    tasks.push({ start: e.startTime, duration: e.duration })
    console.log(`[longtask] ${e.duration.toFixed(0)}ms started +${(e.startTime - T.t0).toFixed(0)}ms${T.dragging ? " DURING DRAG" : ""}`)
  })
).observe({ entryTypes: ["longtask"] })

type Trace = {
  frames: { name: string; resourceId?: number; line?: number }[]
  resources: string[]
  samples: { timestamp: number; stackId?: number }[]
  stacks: { parentId?: number; frameId: number }[]
}
let profiler: { stop: () => Promise<Trace> } | null = null

const label = (trace: Trace, frameId: number) => {
  const frame = trace.frames[frameId]
  const file = frame.resourceId === undefined ? "" : trace.resources[frame.resourceId].split("/").pop()?.split("?")[0]
  return `${frame.name || "(anonymous)"} ${file ?? ""}:${frame.line ?? "?"}`
}

// Samples the page's own JavaScript from a press until a few seconds after, then says, for each
// long task, which functions the time was in.
export function profileDrag() {
  if (profiler) return
  try {
    profiler = new (window as unknown as { Profiler: new (o: object) => typeof profiler }).Profiler({ sampleInterval: 1, maxBufferSize: 200000 })
  } catch {
    console.log("[profile] not available: restart the dev server so that it sends the Document-Policy header")
    return
  }
  const started = performance.now()
  tasks.length = 0
  setTimeout(async () => {
    const trace = await profiler!.stop()
    profiler = null
    for (const task of tasks.filter((t) => t.start >= started - 300)) {
      const own = new Map<string, number>()
      const within = new Map<string, number>()
      let count = 0
      for (const sample of trace.samples) {
        if (sample.timestamp < task.start || sample.timestamp > task.start + task.duration) continue
        count++
        const seen = new Set<string>()
        for (let id = sample.stackId, first = true; id !== undefined; id = trace.stacks[id].parentId, first = false) {
          const name = label(trace, trace.stacks[id].frameId)
          if (first) own.set(name, (own.get(name) ?? 0) + 1)
          if (!seen.has(name)) within.set(name, (within.get(name) ?? 0) + 1)
          seen.add(name)
        }
      }
      const top = (m: Map<string, number>, n: number) =>
        [...m].sort((a, b) => b[1] - a[1]).slice(0, n).map(([k, v]) => `    ${v} ${k}`).join("\n")
      console.log(
        `[profile] longtask ${task.duration.toFixed(0)}ms at +${(task.start - T.t0).toFixed(0)}ms (${count} samples)\n` +
          `  in (self):\n${top(own, 8)}\n  in (including callees):\n${top(within, 14)}`
      )
    }
  }, 4000)
}
