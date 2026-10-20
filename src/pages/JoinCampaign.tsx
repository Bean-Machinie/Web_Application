import { Navigate, useSearchParams } from "react-router-dom"

// Joining happens in a dialog on the campaigns home. This address only stays so
// that links from before the invite page existed still work.
export function JoinCampaign() {
  const code = useSearchParams()[0].get("code")

  return <Navigate to={code ? `/invite?code=${code}` : "/app"} replace />
}
