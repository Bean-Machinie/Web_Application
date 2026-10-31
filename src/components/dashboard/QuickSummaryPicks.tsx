import { skillName } from "@/lib/character-format"
import { picksOf } from "@/lib/character-grants"
import { weaponById } from "@/lib/character-templates/srd-5-2-1-gear"
import { readSuggested } from "@/lib/quick-state"
import type { SheetActions } from "./character-actions"
import { SuggestedMarker } from "./SuggestedMarker"

const PICK_ROWS: { field: string; label: string; name: (id: string) => string }[] = [
  { field: "class-style", label: "Fighting Style", name: (id) => id },
  { field: "species-feat", label: "Versatile", name: (id) => id },
  { field: "class-masteries", label: "Weapon mastery", name: (id) => weaponById(id)?.label ?? id },
  { field: "languages", label: "Languages", name: (id) => id },
  { field: "class-expertise", label: "Expertise", name: skillName },
]

// The picks that have no place of their own on the sheet, listed in the summary while they are
// the quick build’s suggestions.
export function QuickSummaryPicks({ actions }: { actions: SheetActions }) {
  const suggested = readSuggested(actions.values)
  const rows = PICK_ROWS.filter(({ field }) => suggested.includes(field) && picksOf(actions, field).length > 0)
  if (rows.length === 0) return null

  return (
    <dl className="flex flex-col gap-1.5 border-t pt-3">
      {rows.map(({ field, label, name }) => (
        <div key={field} className="flex items-start justify-between gap-2 text-sm">
          <div className="min-w-0">
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd>{picksOf(actions, field).map(name).join(", ")}</dd>
          </div>
          <SuggestedMarker markerKey={field} actions={actions} />
        </div>
      ))}
    </dl>
  )
}
