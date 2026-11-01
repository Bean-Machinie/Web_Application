import type { ReactNode } from "react"
import { useAuth } from "@/auth/useAuth"
import { FullScreenSpinner } from "@/components/FullScreenSpinner"
import { useCampaign } from "./useCampaign"

// Holds the whole app back behind the same spinner the sign-in check shows,
// until the person's name and campaigns have arrived, so nothing pops in or
// shifts after the page appears.
export function ShellGate({ children }: { children: ReactNode }) {
  const { profileReady } = useAuth()
  const { loading } = useCampaign()

  if (loading || !profileReady) return <FullScreenSpinner />

  return <div className="animate-in fade-in duration-300">{children}</div>
}
