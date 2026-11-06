import { readCreatureStats, sourceMonster } from "@/lib/creature-stats"
import type { FieldViewProps } from "./field-types"
import { StatBlock } from "./StatBlock"

// A creature's stat block as a player reads it.
export function CreatureStatsView({ value }: FieldViewProps) {
  const stats = readCreatureStats(value)
  if (!stats) return null
  return (
    <div className="flex flex-col gap-3">
      <StatBlock block={stats.statBlock} source={sourceMonster(stats.compendiumRef)?.source} />
    </div>
  )
}
