import { MAGIC_INITIATE_FEATS } from "@/lib/character-templates/srd-5-2-1"
import { FEAT_NOTES } from "@/lib/character-templates/srd-5-2-1-glossary"
import type { SheetActions } from "./character-actions"
import { BuilderChoiceSelect } from "./BuilderChoiceSelect"

type Props = { feat: string; abilityFieldId: string; actions: SheetActions }

// What an Origin feat gives, in a muted box. A Magic Initiate feat also asks for its
// spellcasting ability.
export function BuilderFeatBox({ feat, abilityFieldId, actions }: Props) {
  const note = FEAT_NOTES[feat]
  return (
    <div className="bg-muted/60 grid gap-2 rounded-lg px-3 py-2.5 text-sm">
      <p className="text-muted-foreground">{note ? note.benefits : "See the Feats section of the SRD."}</p>
      {MAGIC_INITIATE_FEATS.includes(feat) && (
        <div className="flex items-center justify-between gap-3">
          <span>Spellcasting ability</span>
          <BuilderChoiceSelect fieldId={abilityFieldId} actions={actions} placeholder="Choose…" />
        </div>
      )}
    </div>
  )
}
