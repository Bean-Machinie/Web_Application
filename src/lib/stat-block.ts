export type StatAction = { id: string; name: string; text: string }

// Every part is optional. `v` lets the shape grow (current health, dice,
// system presets) without a migration.
export type StatBlock = {
  v: 1
  health?: number
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
