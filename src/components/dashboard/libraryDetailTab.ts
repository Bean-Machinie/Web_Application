import { BookMarked, FileText } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { monsterById } from "@/lib/compendium-monsters"
import type { LibraryTab } from "@/lib/library-tabs"
import { ruleEntry } from "@/lib/rules-terms"
import { monsterIcon } from "@/lib/srd-entries"
import { srdPath } from "@/lib/srd-paths"
import type { WorldEntry } from "@/lib/world-entries"
import { WORLD_KINDS } from "@/lib/world-kinds"

const FALLBACK: LucideIcon = FileText

// What a tab of the detail panel shows of itself: its name and icon, where its own page is, and
// the thing it opens (the entry, creature or rule), whichever it is.
export function describeLibraryTab(tab: LibraryTab, entries: WorldEntry[] | null, basePath: string) {
  if (tab.kind === "creature") {
    const monster = monsterById(tab.id)
    return { title: monster?.name ?? "Creature", icon: monster ? monsterIcon(monster) : FALLBACK, fullPage: srdPath("creatures", tab.id), monster }
  }
  if (tab.kind === "rule") {
    const rule = ruleEntry(tab.id)
    return { title: rule?.title ?? "Rule", icon: BookMarked as LucideIcon, fullPage: srdPath("rules", tab.id), rule }
  }
  const entry = entries?.find((candidate) => candidate.id === tab.id)
  return { title: entry?.name ?? "Entry", icon: entry ? WORLD_KINDS[entry.kind].icon : FALLBACK, fullPage: `${basePath}/${tab.id}`, entry }
}
