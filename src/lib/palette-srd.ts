import { BookMarkedIcon } from "@/components/icons/BookMarkedIcon"
import { SwordsIcon } from "@/components/icons/SwordsIcon"
import { MONSTERS } from "./compendium-monsters"
import { best } from "./palette-build"
import type { PaletteGroup } from "./palette-items"
import { matchText } from "./palette-search"
import { matchingEntries, rulesPath } from "./rules-terms"
import { monsterPath } from "./srd-paths"

// The SRD's rules and creatures. A rule is found by what the rules list's own search finds (its
// summary and its other names too), the ones named for the search first. Neither is worth
// remembering as a recent, so they are page rows and not entries.
export function srdGroups(query: string): PaletteGroup[] {
  const rules = matchingEntries(query)
    .map((term) => ({ term, hit: matchText(query, term.title) }))
    .sort((a, b) => (b.hit?.score ?? -1) - (a.hit?.score ?? -1))
    .map(({ term, hit }) => ({
      id: `rule:${term.id}`,
      name: term.title,
      context: "Rules",
      path: rulesPath(term.id, query),
      visual: { type: "page" as const, icon: BookMarkedIcon },
      matched: hit?.indices ?? [],
    }))

  const creatures = best(MONSTERS, query, (monster) => monster.name, (monster, matched) => ({
    id: `monster:${monster.id}`,
    name: monster.name,
    context: `CR ${monster.statBlock.cr.value} · ${monster.statBlock.type}`,
    path: monsterPath(monster.id),
    visual: { type: "page", icon: SwordsIcon },
    matched,
  }))

  return [
    { heading: "Rules", items: rules },
    { heading: "Creatures", items: creatures },
  ]
}
