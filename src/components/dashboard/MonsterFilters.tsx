import { ANY, CR_VALUES, MONSTER_TYPES } from "@/lib/compendium-monsters"
import type { MonsterFilter } from "@/lib/compendium-monsters"
import { FilterPopover } from "./FilterPopover"

const options = (values: string[]) => [{ value: ANY, label: "Any" }, ...values.map((value) => ({ value, label: value }))]

type Props = { filter: MonsterFilter; onChange: (change: Partial<MonsterFilter>) => void }

// The CR range and the creature type, in the app's one filter popover.
export function MonsterFilters({ filter, onChange }: Props) {
  return (
    <FilterPopover
      groups={[
        { label: "CR from", value: filter.crMin, options: options(CR_VALUES), onChange: (crMin) => onChange({ crMin }), select: true },
        { label: "CR to", value: filter.crMax, options: options(CR_VALUES), onChange: (crMax) => onChange({ crMax }), select: true },
        { label: "Creature type", value: filter.type, options: options(MONSTER_TYPES), onChange: (type) => onChange({ type }), select: true },
      ]}
    />
  )
}
