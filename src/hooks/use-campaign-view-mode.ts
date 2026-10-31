import { useAuth } from "@/auth/useAuth"
import { useStoredValue } from "./use-stored-value"

export type CampaignViewMode = "list" | "grid"

const read = (text: string | null): CampaignViewMode => (text === "list" ? "list" : "grid")

// Remembered per user, in this browser.
export const useCampaignViewMode = () => useStoredValue(`campaigns-view:${useAuth().session!.user.id}`, read)
