import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { FullScreenSpinner } from "@/components/FullScreenSpinner"
import { logInPath } from "@/lib/auth-next"
import { useAuth } from "./useAuth"

export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <FullScreenSpinner />
  }

  if (!session) {
    return <Navigate to={logInPath(location.pathname + location.search)} replace />
  }

  return children
}
