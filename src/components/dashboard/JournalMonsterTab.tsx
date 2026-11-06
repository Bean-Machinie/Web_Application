import { monsterById } from "@/lib/compendium-monsters"
import type { TabContentProps } from "./journal-tab-kinds"
import { SrdCreatureView } from "./SrdCreatureView"

// An SRD creature in a tab: its read-only page, with the button that adds it to the campaign.
export function JournalMonsterTab({ id }: TabContentProps) {
  const monster = monsterById(id)
  return <div className="p-4 md:p-6">{monster && <SrdCreatureView monster={monster} />}</div>
}
