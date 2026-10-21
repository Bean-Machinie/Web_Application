// The graph's settings, like the panel of Obsidian's graph view: what to show, how
// it looks, and the forces that lay it out.
export type GraphSettings = {
  // Filters
  showLoose: boolean
  // Display
  nodeSize: number
  lineThickness: number
  // The zoom at which names start to fade in.
  labelThreshold: number
  // Forces
  centerForce: number
  repelForce: number
  linkForce: number
  linkDistance: number
}

export const DEFAULT_SETTINGS: GraphSettings = {
  showLoose: true,
  nodeSize: 1,
  lineThickness: 1,
  labelThreshold: 1.1,
  centerForce: 0.05,
  repelForce: 80,
  linkForce: 1,
  linkDistance: 60,
}

type Range = { min: number; max: number; step: number }

export const RANGES: Record<Exclude<keyof GraphSettings, "showLoose">, Range> = {
  nodeSize: { min: 0.5, max: 2.5, step: 0.1 },
  lineThickness: { min: 0.5, max: 3, step: 0.1 },
  labelThreshold: { min: 0.3, max: 3, step: 0.1 },
  centerForce: { min: 0, max: 0.2, step: 0.005 },
  repelForce: { min: 0, max: 300, step: 5 },
  linkForce: { min: 0, max: 1, step: 0.05 },
  linkDistance: { min: 20, max: 200, step: 5 },
}

const KEY = "world-graph-settings"

// What this browser remembered, with anything missing or out of range back at its
// default.
export function loadSettings(): GraphSettings {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<GraphSettings>
    const settings = { ...DEFAULT_SETTINGS }
    if (typeof stored.showLoose === "boolean") settings.showLoose = stored.showLoose
    for (const name of Object.keys(RANGES) as (keyof typeof RANGES)[]) {
      const value = stored[name]
      if (typeof value === "number" && value >= RANGES[name].min && value <= RANGES[name].max) {
        settings[name] = value
      }
    }
    return settings
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(settings: GraphSettings) {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings))
  } catch {
    // The settings just will not be remembered.
  }
}
