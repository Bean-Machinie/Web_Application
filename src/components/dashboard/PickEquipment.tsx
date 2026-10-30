import { origins, picksOf } from "@/lib/character-grants"
import type { Kit } from "@/lib/character-templates/srd-5-2-1-choices"
import { BACKGROUND_KITS, CLASS_KITS } from "@/lib/character-templates/srd-5-2-1-kits"
import { PickKitCard } from "./PickKitCard"
import type { SheetActions } from "./character-actions"
import { kitAc } from "./character-kits"

type Props = { draft: Record<string, unknown>; onDraft: (next: Record<string, unknown>) => void; actions: SheetActions }

// The class's and the background's starting equipment, each a card to choose: a kit or gold.
export function PickEquipment({ draft, onDraft, actions }: Props) {
  const { cls, background } = origins(actions)
  const dex = actions.derived["dex.mod"] ?? null
  const defense = picksOf(actions, "class-style").includes("Defense")
  const armorClass = (kit: Kit) => kitAc(kit, dex, defense)

  return (
    <div className="flex flex-col gap-4">
      {cls && (
        <PickKitCard
          title={`From ${cls.label}`}
          kits={CLASS_KITS[cls.id]}
          selected={(draft["equipment-class"] as string | null) ?? null}
          armorClass={armorClass}
          onSelect={(kit) => onDraft({ ...draft, "equipment-class": kit.id })}
        />
      )}
      {background && (
        <PickKitCard
          title={`From ${background.label}`}
          kits={BACKGROUND_KITS[background.id]}
          selected={(draft["equipment-background"] as string | null) ?? null}
          armorClass={() => null}
          onSelect={(kit) => onDraft({ ...draft, "equipment-background": kit.id })}
        />
      )}
    </div>
  )
}
