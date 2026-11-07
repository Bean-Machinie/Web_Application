import type { LibraryTab } from "@/lib/library-tabs"
import type { Monster } from "@/lib/compendium-monsters"
import type { RuleEntry } from "@/lib/srd-rules-types"
import { BreadcrumbContext } from "./BreadcrumbContext"
import { RuleTermView } from "./RuleTermView"
import { SrdCreatureBody } from "./SrdCreatureBody"
import { WorldEntryView } from "./WorldEntryView"

type Props = {
  tab: LibraryTab
  monster: Monster | undefined
  rule: RuleEntry | undefined
  onSelectRule: (termId: string) => void
}

// The entry's own page, the existing rule term view, or the read-only creature view. The entry's
// page would set the header's trail, which here belongs to the library, so it is given one of
// its own that is not shown.
const OWN_TRAIL = { trail: null, setTrail: () => {} }

export function LibraryDetailBody({ tab, monster, rule, onSelectRule }: Props) {
  if (tab.kind === "entry") {
    return (
      <BreadcrumbContext.Provider value={OWN_TRAIL}>
        <div className="flex min-h-full flex-col gap-4">
          <WorldEntryView key={tab.id} entryId={tab.id} />
        </div>
      </BreadcrumbContext.Provider>
    )
  }
  if (monster) return <SrdCreatureBody monster={monster} />
  if (rule) return <RuleTermView termId={rule.id} onSelect={onSelectRule} />
  return <p className="text-muted-foreground text-sm">This is not in the SRD.</p>
}
