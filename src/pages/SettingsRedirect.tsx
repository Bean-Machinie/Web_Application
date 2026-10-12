import { Navigate, useParams } from "react-router-dom"

// The old settings pages now open the settings window over the overview.
export function SettingsRedirect() {
  const { tab } = useParams()
  return <Navigate to={`/app?settings=${tab ?? "profile"}`} replace />
}
