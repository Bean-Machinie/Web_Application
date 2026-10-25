import type { ReactNode } from "react"
import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityFacts } from "./ability-facts"
import { AbilityBadges } from "./AbilityBadges"

type Props = { id: AbilityId; label: string; facts: AbilityFacts; children: ReactNode }

// One ability in the dialog: its name with the same badges as the sheet, and the control.
export function AbilityRow({ id, label, facts, children }: Props) {
  return (
    <div className="flex min-h-9 items-center justify-between gap-3">
      <span className="flex min-w-0 items-center gap-2">
        <span className="text-sm">{label}</span>
        <AbilityBadges ability={id} facts={facts} />
      </span>
      {children}
    </div>
  )
}
