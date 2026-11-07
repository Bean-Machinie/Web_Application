import { useState } from "react"
import { useLocation } from "react-router-dom"
import type { WorldViewMode } from "@/hooks/use-world-view-mode"
import type { Monster } from "@/lib/compendium-monsters"
import { withItem } from "@/lib/library-nav"
import { monsterIcon, monsterSubtitle, srdEntry } from "@/lib/srd-entries"
import type { RuleEntry } from "@/lib/srd-rules-types"
import { useEntrySelection } from "@/hooks/use-entry-selection"
import { AddMonsterDialog } from "./AddMonsterDialog"
import { FolderPlus } from "lucide-react"
import { BulkMenuContext } from "./BulkMenuContext"
import { CardGrid } from "./CardGrid"
import { SelectionArea } from "./SelectionArea"
import { SrdBulkBar } from "./SrdBulkBar"
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
// panel; nothing here can be changed. Creatures can be picked, as entries are, to add several to a
// campaign at once; rules have nothing to pick.
export function SrdResults({ creatures, rules, mode, openId, showTag }: Props) {
  const { search } = useLocation()
  const [adding, setAdding] = useState<Monster[] | null>(null)
  const to = (id: string) => withItem(search, id)
  const count = (creatures ?? rules ?? []).length
  const ids = (creatures ?? []).map((monster) => srdEntry(monster).id)
  // A new search or filter starts the picking over, as it does for entries.
  const selection = useEntrySelection({ visibleIds: ids, allIds: ids, viewKey: ids.join(","), enabled: creatures !== null })
  const chosen = (creatures ?? []).filter((monster) => selection.isSelected(srdEntry(monster).id))
  const picking = creatures ? selection : null
  // A right-click on a picked creature adds all the picked ones.
  const menu = picking ? { selection: picking, actions: [{ label: "Add to campaign…", icon: FolderPlus, onSelect: () => setAdding(chosen) }] } : null
  const dialog = (
    <>
      {adding && <AddMonsterDialog monsters={adding} open onClose={() => setAdding(null)} />}
      {picking && <SrdBulkBar selection={picking} onAdd={() => setAdding(chosen)} />}
    </>
  )
  if (count === 0) return <p className="text-muted-foreground px-2 py-10 text-center text-sm">No match. Try a different name, or another section.</p>

  if (mode === "list") {
    const columns = creatures ? CREATURE_COLUMNS : ruleColumns(showTag)
    const rows = creatures ? creatureRows(creatures, to, (monster) => setAdding([monster])) : ruleRows(rules ?? [], to, showTag)
    return (
      <BulkMenuContext value={menu}>
        <SrdTable columns={columns} rows={rows} openId={openId} selection={picking} />
        {dialog}
      </BulkMenuContext>
    )
  }

  return (
    <BulkMenuContext value={menu}>
    <SelectionArea selection={picking}>
      <CardGrid>
        {(creatures ?? []).map((monster) => (
          <div key={monster.id} data-entry-id={srdEntry(monster).id} className="rounded-lg select-none">
            <WorldEntryCard
              entry={srdEntry(monster)}
              manage={null}
              selection={picking}
              to={to(monster.id)}
              subtitle={monsterSubtitle(monster)}
              icon={monsterIcon(monster)}
              highlighted={openId === monster.id}
              itemId={monster.id}
              onAdd={() => setAdding([monster])}
            />
          </div>
        ))}
      </CardGrid>
      {dialog}
    </SelectionArea>
    </BulkMenuContext>
  )
}
