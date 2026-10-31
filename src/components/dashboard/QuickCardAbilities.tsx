import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import type { CardModel } from "@/lib/quick-card"
import type { SheetActions } from "./character-actions"
import { FieldEditedMarker } from "./FieldEditedMarker"
import { StatGrid } from "./StatGrid"

type Props = { shown: CardModel; base: CardModel; actions: SheetActions; onOpen: (ability: AbilityId) => void }

// The six abilities in a grid of six: the modifier large and the score under it. A click opens that
// ability in the Abilities workspace.
export function QuickCardAbilities({ shown, base, actions, onOpen }: Props) {
  return (
    <section aria-label="Abilities" className="flex flex-col gap-2">
      <h3 className="text-muted-foreground text-xs font-medium">Abilities</h3>
      <StatGrid
        label="Ability scores"
        cells={shown.mods.map((mod, index) => ({
          key: mod.id,
          label: mod.label,
          value: mod.mod,
          changed: mod.mod !== base.mods[index].mod,
          sub: mod.score,
          subChanged: mod.score !== base.mods[index].score,
          onOpen: () => onOpen(mod.id as AbilityId),
          openLabel: `${mod.label}, ${mod.mod}, score ${mod.score}. Open in Abilities`,
          extra: <FieldEditedMarker actions={actions} fields={[`${mod.id}.total`, `${mod.id}.mod`]} label={mod.label} />,
        }))}
      />
    </section>
  )
}
