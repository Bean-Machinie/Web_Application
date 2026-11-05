import { Navigate, useNavigate, useParams } from "react-router-dom"
import { PlainBackground } from "@/components/dashboard/PlainBackground"
import { RulesDocument } from "@/components/dashboard/RulesDocument"
import { useCurrentCampaign } from "@/components/dashboard/useCurrentCampaign"
import { usePageTrail } from "@/components/dashboard/usePageTrail"
import { campaignPath } from "@/lib/campaign-paths"
import { usesDnd5e } from "@/lib/game-system"
import { ruleTerm, rulesPath } from "@/lib/rules-terms"

// The rules of a D&D 5e campaign as one document. An address with a term goes to that term.
export function Rules() {
  const { current } = useCurrentCampaign()
  const { termId } = useParams()
  const navigate = useNavigate()
  const term = ruleTerm(termId)
  usePageTrail([{ label: "Rules", to: rulesPath(current.id) }, ...(term ? [{ label: term.entry.title }] : [])])

  if (!usesDnd5e(current)) return <Navigate to={campaignPath(current.id)} replace />

  return (
    <div className="-m-4 h-[calc(100svh-var(--header-height))] min-w-0 flex-none overflow-y-auto md:-m-6">
      <PlainBackground />
      {/* A link in the document changes the address; the address is what scrolls it. */}
      <RulesDocument initialTerm={term?.id} onVisit={(id) => navigate(rulesPath(current.id, id), { replace: true })} />
    </div>
  )
}
