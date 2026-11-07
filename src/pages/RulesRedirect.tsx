import { Navigate, useLocation, useParams } from "react-router-dom"

// The compendium used to be called Rules, at /app/rules/...; old links land in the compendium.
export function RulesRedirect() {
  const rest = useParams()["*"]
  const { search } = useLocation()
  return <Navigate to={`/app/compendium${rest ? `/${rest}` : ""}${search}`} replace />
}
