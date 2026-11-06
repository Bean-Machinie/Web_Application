import { CREATURE_STATS_FIELD, newCreatureStats } from "./creature-stats"
import type { Monster } from "./compendium-monsters"
import { createWorldEntry } from "./world-entries"
import type { WorldEntryKind } from "./world-kinds"
import { setWorldFieldValue } from "./world-fields"

// A Creature (or NPC) entry named for the monster, holding its own copy of the stat block. The block is
// private, as a creature's hidden detail is: the GM reveals it when they choose.
export async function addMonsterToCampaign(campaignId: string, monster: Monster, kind: Extract<WorldEntryKind, "creature" | "npc"> = "creature") {
  const entry = await createWorldEntry(campaignId, kind, monster.name)
  await setWorldFieldValue(entry.id, CREATURE_STATS_FIELD, "creature_stats", newCreatureStats(monster), true)
  return entry
}
