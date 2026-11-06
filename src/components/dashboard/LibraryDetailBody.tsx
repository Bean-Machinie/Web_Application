import type { Monster } from "@/lib/compendium-monsters"
import type { RuleEntry } from "@/lib/srd-rules-types"
import { BreadcrumbContext } from "./BreadcrumbContext"
import { RuleTermView } from "./RuleTermView"
import { SrdCreatureBody } from "./SrdCreatureBody"
import { WorldEntryView } from "./WorldEntryView"

type Props = {
  itemId: string
  monster: Monster | undefined
  rule: RuleEntry | undefined
  onSrd: boolean
  onSelectRule: (termId: string) => void
}

// The entry's own page, the existing rule term view, or the read-only creature view. The entry's
// page would set the header's trail, which here belongs to the library, so it is given one of
// its own that is not shown.
const OWN_TRAIL = { trail: null, setTrail: () => {} }

export function LibraryDetailBody({ itemId, monster, rule, onSrd, onSelectRule }: Props) {
  if (!onSrd) {
    return (
      <BreadcrumbContext.Provider value={OWN_TRAIL}>
        <div className="flex min-h-full flex-col gap-4">
          <WorldEntryView key={itemId} entryId={itemId} />
        </div>
      </BreadcrumbContext.Provider>
    )
  }
  if (monster) return <SrdCreatureBody monster={monster} />
  if (rule) return <RuleTermView termId={rule.id} onSelect={onSelectRule} />
  return <p className="text-muted-foreground text-sm">This is not in the SRD.</p>
}
