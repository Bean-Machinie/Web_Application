import { Badge } from "@/components/ui/badge"
import type { AbilityId } from "@/lib/character-templates/srd-5-2-1"
import type { AbilityFacts } from "./ability-facts"

const SMALL = "h-4 px-1.5 text-[10px]"

// "Primary" for the class's primary abilities and "Save" for the saving throws it is
// proficient in, as the SRD lists them.
export function AbilityBadges({ ability, facts }: { ability: AbilityId; facts: AbilityFacts }) {
  return (
    <span className="flex items-center gap-1">
      {facts.primary.has(ability) && (
        <Badge variant="secondary" className={SMALL} title="Primary ability of the class">
          Primary
        </Badge>
      )}
      {facts.saves.has(ability) && (
        <Badge variant="outline" className={SMALL} title="Saving throw proficiency from the class">
          Save
        </Badge>
      )}
    </span>
  )
}
