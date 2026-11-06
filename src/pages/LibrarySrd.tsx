import { useParams } from "react-router-dom"
import { LibrarySrdPage } from "@/components/dashboard/LibrarySrdPage"
import { SrdCreatureView } from "@/components/dashboard/SrdCreatureView"
import { usePageTrail } from "@/components/dashboard/usePageTrail"
import { monsterById } from "@/lib/compendium-monsters"
import { ruleEntry } from "@/lib/rules-terms"
import { SRD_LABEL, srdPath } from "@/lib/srd-paths"
import type { SrdSection } from "@/lib/srd-paths"

// The SRD in the library. An opened creature is a page of its own, like a library entry; the
// creature list and the rules sit in the library's layout.
export function LibrarySrd() {
  const { section: asked, itemId } = useParams()
  const section: SrdSection = asked === "rules" ? "rules" : "creatures"
  const monster = section === "creatures" ? monsterById(itemId) : undefined
  const item = monster?.name ?? (section === "rules" ? ruleEntry(itemId)?.title : undefined)
  usePageTrail([
    { label: "Library", to: "/app/library" },
    { label: SRD_LABEL, to: srdPath() },
    { label: section === "rules" ? "Rules" : "Creatures", to: srdPath(section) },
    ...(item ? [{ label: item }] : []),
  ])

  if (section === "creatures" && itemId) {
    return monster ? <SrdCreatureView monster={monster} /> : <p className="text-muted-foreground text-sm">This creature is not in the SRD.</p>
  }
  return <LibrarySrdPage section={section} termId={itemId} />
}
