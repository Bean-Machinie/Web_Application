import type { CardModel } from "@/lib/quick-card"
import type { SheetActions } from "./character-actions"
import { FieldEditedMarker } from "./FieldEditedMarker"
import { StatGrid } from "./StatGrid"

type Props = { shown: CardModel; base: CardModel; actions: SheetActions }

// Each stat with its short name and, where the player can type over it on the sheet, that field.
const COMBAT = [
  { key: "hp", label: "HP", field: "hp.max" },
  { key: "ac", label: "AC", field: "ac" },
  { key: "speed", label: "Speed", field: "speed" },
  { key: "initiative", label: "Initiative", field: "initiative" },
  { key: "bonus", label: "Proficiency", field: "proficiency-bonus" },
  { key: "hitDice", label: "Hit Dice", field: null },
] as const

// What a fight asks for, in a grid of six. What differs from the committed card `base` is highlighted.
export function QuickCardCombat({ shown, base, actions }: Props) {
  return (
    <section aria-label="Combat" className="flex flex-col gap-2">
      <h3 className="text-muted-foreground text-xs font-medium">Combat</h3>
      <StatGrid
        label="Combat"
        cells={COMBAT.map(({ key, label, field }) => ({
          key,
          label,
          value: shown[key],
          changed: shown[key] !== base[key],
          extra: field && <FieldEditedMarker actions={actions} fields={[field]} label={label} />,
        }))}
      />
    </section>
  )
}
