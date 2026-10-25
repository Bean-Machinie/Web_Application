import { explainKey } from "@/lib/character-glossary"
import type { SheetActions } from "./character-actions"
import { GlossaryLabel } from "./GlossaryLabel"

type Props = { glossaryKey: string; fieldId?: string; actions: SheetActions; children: string }

// A label of the builder with the same hover card as on the sheet, from the glossary.
export function BuilderLabel({ glossaryKey, fieldId = glossaryKey, actions, children }: Props) {
  return (
    <GlossaryLabel explanation={explainKey(glossaryKey, fieldId, actions)}>
      <span>{children}</span>
    </GlossaryLabel>
  )
}
