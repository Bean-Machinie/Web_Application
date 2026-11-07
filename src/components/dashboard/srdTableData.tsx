import { FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Monster } from "@/lib/compendium-monsters"
import { crNumber } from "@/lib/compendium-monsters"
import { categoryTitle } from "@/lib/rules-terms"
import { monsterIcon, monsterTypeIcon, srdEntry } from "@/lib/srd-entries"
import type { RuleEntry } from "@/lib/srd-rules-types"
import { addToCampaignAction } from "./openInNewTab"
import type { SrdColumn } from "./SrdTable"
import type { SrdRow } from "./SrdTableRow"

export const CREATURE_COLUMNS: SrdColumn[] = [
  { key: "type", label: "Type", width: "w-40" },
  { key: "cr", label: "CR", width: "w-24" },
  { key: "size", label: "Size", width: "w-40", narrowHidden: true },
]

export const ruleColumns = (showTag: boolean): SrdColumn[] => (showTag ? [{ key: "category", label: "Category", width: "w-44", narrowHidden: true }] : [])

export function creatureRows(monsters: Monster[], to: (id: string) => string, onAdd: (monster: Monster) => void): SrdRow[] {
  return monsters.map((monster) => {
    const { type, size, alignment, cr } = monster.statBlock
    const TypeIcon = monsterTypeIcon(type)
    return {
      id: monster.id,
      selectId: srdEntry(monster).id,
      to: to(monster.id),
      title: monster.name,
      subtitle: alignment,
      icon: monsterIcon(monster),
      actions: [addToCampaignAction(() => onAdd(monster))],
      sort: { name: monster.name, type, cr: crNumber(cr.value), size: size.join(" or ") },
      cells: [
        <Badge key="type" variant="outline" className="text-muted-foreground">
          <TypeIcon />
          {type}
        </Badge>,
        <span key="cr" className="text-muted-foreground">CR {cr.value}</span>,
        <span key="size" className="text-muted-foreground">{size.join(" or ")}</span>,
      ],
    }
  })
}

// The summary goes under the title, so a row reads in two lines whatever the width.
export function ruleRows(entries: RuleEntry[], to: (id: string) => string, showTag: boolean): SrdRow[] {
  return entries.map((entry) => ({
    id: entry.id,
    to: to(entry.id),
    title: entry.title,
    subtitle: entry.summary,
    icon: FileText,
    actions: [],
    sort: { name: entry.title, category: entry.tag ?? categoryTitle(entry.category) },
    cells: showTag
      ? [
          <Badge key="category" variant="outline" className="text-muted-foreground">
            {entry.tag ?? categoryTitle(entry.category)}
          </Badge>,
        ]
      : [],
  }))
}
