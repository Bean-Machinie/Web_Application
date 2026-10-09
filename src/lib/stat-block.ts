export type StatAction = { id: string; name: string; text: string }

// Every part is optional. `v` lets the shape grow (dice, system presets)
// without a migration. `health` is the maximum; without `healthCurrent` a
// creature is at full health.
export type StatBlock = {
  v: 1
  health?: number
  healthCurrent?: number
  defense?: number
  speed?: string
  actions?: StatAction[]
}

export function readStatBlock(value: unknown): StatBlock {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>
  const number = (n: unknown) => (typeof n === "number" && Number.isFinite(n) ? n : undefined)
  const actions = Array.isArray(raw.actions)
    ? (raw.actions as StatAction[]).filter((action) => action && typeof action.id === "string")
    : []
  return {
    v: 1,
    health: number(raw.health),
    healthCurrent: number(raw.healthCurrent),
    defense: number(raw.defense),
    speed: typeof raw.speed === "string" && raw.speed !== "" ? raw.speed : undefined,
    actions,
  }
}

export function isStatBlockEmpty(value: unknown) {
  const block = readStatBlock(value)
  return (
    block.health === undefined &&
    block.defense === undefined &&
    block.speed === undefined &&
    block.actions?.length === 0
  )
}

// What gets stored: null once nothing is left.
export function toStoredStatBlock(block: StatBlock) {
  return isStatBlockEmpty(block) ? null : block
}

// Never below 0 or above the maximum; undefined while there is no maximum.
export function currentHealth(block: StatBlock) {
  if (block.health === undefined) return undefined
  return Math.min(Math.max(block.healthCurrent ?? block.health, 0), block.health)
}
