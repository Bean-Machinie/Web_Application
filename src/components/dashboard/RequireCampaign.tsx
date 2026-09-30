import type { ReactNode } from "react"
import { Navigate } from "react-router-dom"
import { FullScreenSpinner } from "@/components/FullScreenSpinner"
import { useCampaign } from "./useCampaign"

// The dashboard is only ever shown inside a campaign. Someone with none is
// sent to the campaigns page instead.
export function RequireCampaign({ children }: { children: ReactNode }) {
  const { current, loading } = useCampaign()

  if (loading) return <FullScreenSpinner />
  if (!current) return <Navigate to="/campaigns" replace />

  return children
}
