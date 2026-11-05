import { usesDnd5e } from "@/lib/game-system"
import { useRouteCampaign } from "./useCurrentCampaign"

// The campaign the page is in, when it plays D&D 5e: the only place the rules chips and the
// Rules page apply. Null everywhere else.
export function useRulesCampaign() {
  const campaign = useRouteCampaign()
  return campaign && usesDnd5e(campaign) ? campaign : null
}
