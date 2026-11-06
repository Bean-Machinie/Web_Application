import { useState } from "react"
import { ANY, CR_VALUES, matchingMonsters } from "@/lib/compendium-monsters"
import { RULE_ENTRIES, matchingEntries } from "@/lib/rules-terms"
import { srdChild, srdSectionOf } from "@/lib/srd-items"
import type { FilterGroup } from "@/components/dashboard/FilterPopover"

const options = (values: string[]) => [{ value: ANY, label: "Any" }, ...values.map((value) => ({ value, label: value }))]

const TAGS = [...new Set(RULE_ENTRIES.flatMap((entry) => (entry.tag ? [entry.tag] : [])))].sort()

// What an SRD node of the tree shows once the search and the filter have had their say, and the
// filter's groups for the toolbar: a CR range for creatures, a tag for rules. `creatures` is null
// on a rules node and the other way round.
export function useSrdView(nodeId: string, query: string) {
  const [crMin, setCrMin] = useState(ANY)
  const [crMax, setCrMax] = useState(ANY)
  const [tag, setTag] = useState(ANY)
  const child = srdChild(nodeId)

  if (srdSectionOf(nodeId) === "rules") {
    const rules = matchingEntries(query).filter((entry) => (!child || entry.category === child) && (tag === ANY || entry.tag === tag))
    const filters: FilterGroup[] = [{ label: "Tag", value: tag, options: options(TAGS), onChange: setTag, select: true }]
    return { creatures: null, rules, filters }
  }

  const creatures = matchingMonsters({ query, crMin, crMax, type: child || ANY })
  const filters: FilterGroup[] = [
    { label: "CR from", value: crMin, options: options(CR_VALUES), onChange: setCrMin, select: true },
    { label: "CR to", value: crMax, options: options(CR_VALUES), onChange: setCrMax, select: true },
  ]
  return { creatures, rules: null, filters }
}
