import { useContext } from "react"
import { CampaignContext } from "./CampaignContext"

export function useCampaign() {
  return useContext(CampaignContext)
}
