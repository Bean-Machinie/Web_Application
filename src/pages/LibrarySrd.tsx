import { Navigate, useParams } from "react-router-dom"
import { SrdCreatureView } from "@/components/dashboard/SrdCreatureView"
import { usePageTrail } from "@/components/dashboard/usePageTrail"
import { monsterById } from "@/lib/compendium-monsters"
import { ruleEntry, rulesPath } from "@/lib/rules-terms"
import { SRD_LABEL, srdNodeId } from "@/lib/srd-paths"
import type { SrdSection } from "@/lib/srd-paths"

// An SRD creature or rules term on a page of its own, which the panel of the compendium links to as
// "Open full page", for creatures. Rules open in the panel. Without an item there is nothing to show: the compendium has the list.
export function LibrarySrd() {
  const { section: asked, itemId } = useParams()
  const section: SrdSection = asked === "rules" ? "rules" : "creatures"
  const monster = section === "creatures" ? monsterById(itemId) : undefined
  const rule = section === "rules" ? ruleEntry(itemId) : undefined
  const item = monster?.name ?? rule?.title
  usePageTrail([
    { label: "Compendium", to: `/app/compendium?section=${encodeURIComponent(srdNodeId(section))}` },
    { label: SRD_LABEL, to: `/app/compendium?section=${encodeURIComponent(srdNodeId(section))}` },
    ...(item ? [{ label: item }] : []),
  ])

  if (!itemId) return <Navigate to={`/app/compendium?section=${encodeURIComponent(srdNodeId(section))}`} replace />
  if (monster) return <SrdCreatureView monster={monster} />
  // Rules are read in the panel of the compendium, not on a page of their own.
  if (rule) return <Navigate to={rulesPath(rule.id)} replace />
  return <p className="text-muted-foreground text-sm">This is not in the SRD.</p>
}
