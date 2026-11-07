import { useState } from "react"
import { useLocation } from "react-router-dom"
import type { WorldViewMode } from "@/hooks/use-world-view-mode"
import type { Monster } from "@/lib/compendium-monsters"
import { withItem } from "@/lib/library-nav"
import { monsterIcon, monsterSubtitle, srdEntry } from "@/lib/srd-entries"
import type { RuleEntry } from "@/lib/srd-rules-types"
import { AddMonsterDialog } from "./AddMonsterDialog"
import { CardGrid } from "./CardGrid"
import { SrdTable } from "./SrdTable"
import { CREATURE_COLUMNS, creatureRows, ruleColumns, ruleRows } from "./srdTableData"
import { WorldEntryCard } from "./WorldEntryCard"

type Props = {
  creatures: Monster[] | null
  rules: RuleEntry[] | null
  mode: WorldViewMode
  // The item open in the panel.
  openId: string | null
  // The rule's category badge: not inside a category, where every row has the same one.
  showTag: boolean
}

// The SRD's creatures or rules, as the library's cards or its list. Clicking one opens it in the
// panel; nothing here can be changed, so there is no menu and nothing to pick.
export function SrdResults({ creatures, rules, mode, openId, showTag }: Props) {
  const { search } = useLocation()
  const [adding, setAdding] = useState<Monster | null>(null)
  const to = (id: string) => withItem(search, id)
  const count = (creatures ?? rules ?? []).length
  const dialog = adding && <AddMonsterDialog monster={adding} open onClose={() => setAdding(null)} />
  if (count === 0) return <p className="text-muted-foreground px-2 py-10 text-center text-sm">No match. Try a different name, or another section.</p>

  if (mode === "list") {
    const columns = creatures ? CREATURE_COLUMNS : ruleColumns(showTag)
    const rows = creatures ? creatureRows(creatures, to, setAdding) : ruleRows(rules ?? [], to, showTag)
    return (
      <>
        <SrdTable columns={columns} rows={rows} openId={openId} />
        {dialog}
      </>
    )
  }

  return (
    <CardGrid>
      {(creatures ?? []).map((monster) => (
        <WorldEntryCard
          key={monster.id}
          entry={srdEntry(monster)}
          manage={null}
          selection={null}
          to={to(monster.id)}
          subtitle={monsterSubtitle(monster)}
          icon={monsterIcon(monster)}
          highlighted={openId === monster.id}
          itemId={monster.id}
          onAdd={() => setAdding(monster)}
        />
      ))}
      {dialog}
    </CardGrid>
  )
}
