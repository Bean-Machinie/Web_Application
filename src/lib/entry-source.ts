import { sourceMonster, readCreatureStats } from "./creature-stats"
import { SRD_LABEL, monsterPath } from "./srd-paths"
import type { WorldEntry } from "./world-entries"

export type EntrySource = {
  kind: "library" | "srd"
  // The id of the original: a library entry, or an SRD monster.
  id: string
  // The whole line an entry's view shows.
  label: string
}

// Where an entry came from, whichever of the two stored fields says so: the stat block's
// reference to the SRD, or source_entry_id for a copy from the library. The SRD wins when both
// are there, as it is the older origin. A copy made into the library points at a campaign
// entry, which is not a library source, so it has none.
export function getEntrySource(entry: WorldEntry, creatureStats?: unknown): EntrySource | null {
  const monster = sourceMonster(readCreatureStats(creatureStats)?.compendiumRef)
  if (monster) return { kind: "srd", id: monster.id, label: `From ${SRD_LABEL} · ${monster.name}` }
  if (entry.sourceEntryId && !entry.inLibrary) return { kind: "library", id: entry.sourceEntryId, label: "From your library" }
  return null
}

export const entrySourcePath = (source: EntrySource) =>
  source.kind === "srd" ? monsterPath(source.id) : `/app/library/${source.id}`
