import { campaignPath } from "./campaign-paths"
import { readCreatureStats, CREATURE_STATS_FIELD } from "./creature-stats"
import { monsterPath } from "./srd-paths"
import type { StatBlock } from "./stat-block-types"
import { supabase } from "./supabase"
import { ENTRY_KIND_IMAGES } from "./tool-images"
import { toWorldImage } from "./world-images"
import { COVER_FIELD } from "./world-kinds"

// A creature the Compendium tile can show: its picture, a few numbers of its stat block, and where it opens.
export type ShowcaseCreature = {
  key: string
  name: string
  image: string
  path: string
  ac: number | null
  hp: number | null
  cr: string | null
}

const SHOWN = 40

const numbers = (block: StatBlock | undefined) => ({ ac: block?.ac ?? null, hp: block?.hp.average ?? null, cr: block?.cr.value ?? null })

// The newest creatures with a picture that the person can see, in their library and their campaigns;
// row level security decides which, and which stat blocks they may read.
export async function fetchShowcaseCreatures(): Promise<ShowcaseCreature[]> {
  const { data, error } = await supabase
    .from("world_entries")
    .select("id, name, campaign_id, world_entry_fields!entry_id(key, value)")
    .eq("kind", "creature")
    .in("world_entry_fields.key", [COVER_FIELD, CREATURE_STATS_FIELD])
    .order("updated_at", { ascending: false })
    .limit(SHOWN)
  if (error) throw error

  return (data as Record<string, unknown>[]).flatMap((row) => {
    const fields = (row.world_entry_fields as { key: string; value: unknown }[] | undefined) ?? []
    const valueOf = (key: string) => fields.find((field) => field.key === key)?.value
    const image = toWorldImage(valueOf(COVER_FIELD))?.url
    if (!image) return []
    const id = row.id as string
    const campaignId = row.campaign_id as string | null
    return [
      {
        key: id,
        name: row.name as string,
        image,
        path: campaignId ? campaignPath(campaignId, `world/${id}`) : `/app/library/${id}`,
        ...numbers(readCreatureStats(valueOf(CREATURE_STATS_FIELD))?.statBlock),
      },
    ]
  })
}

// The SRD Wolf, for someone with no creature pictures yet. The monster list is large, so it is loaded
// only then.
export async function wolfCreature(): Promise<ShowcaseCreature> {
  const { monsterById } = await import("./compendium-monsters")
  const wolf = monsterById("wolf")
  return { key: "srd:wolf", name: wolf?.name ?? "Wolf", image: ENTRY_KIND_IMAGES.creature ?? "", path: monsterPath("wolf"), ...numbers(wolf?.statBlock) }
}
