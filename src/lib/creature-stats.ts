import { SRD_SOURCE, monsterById } from "./compendium-monsters"
import type { Monster } from "./compendium-monsters"
import type { StatBlock } from "./stat-block-types"

// The key and type of the field that holds a creature's stat block on a world entry.
export const CREATURE_STATS_FIELD = "creature_stats"

export type CompendiumRef = { source: string; id: string }

// What the field stores: the block the GM edits, and where it was copied from.
export type CreatureStats = { statBlock: StatBlock; compendiumRef?: CompendiumRef }

export function newCreatureStats(monster: Monster): CreatureStats {
  return { statBlock: structuredClone(monster.statBlock), compendiumRef: { source: SRD_SOURCE, id: monster.id } }
}

export function readCreatureStats(value: unknown): CreatureStats | null {
  const raw = value as Partial<CreatureStats> | null
  return raw && typeof raw === "object" && raw.statBlock?.abilities ? (raw as CreatureStats) : null
}

export const isCreatureStatsEmpty = (value: unknown) => readCreatureStats(value) === null

// The compendium monster a block was copied from, if it is still there.
export const sourceMonster = (ref: CompendiumRef | undefined) => (ref?.source === SRD_SOURCE ? monsterById(ref.id) : undefined)
