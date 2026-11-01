import { Navigate, useLocation } from "react-router-dom"

// The old auth addresses, which links and emails already sent out may still
// use. The query and hash come along, so `next` and provider errors survive.
export function LegacyAuthRedirect({ to }: { to: string }) {
  const { search, hash } = useLocation()

  return <Navigate to={{ pathname: to, search, hash }} replace />
}
