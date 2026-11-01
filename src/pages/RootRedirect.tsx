import { Navigate } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { FullScreenSpinner } from "@/components/FullScreenSpinner"
import { APP_HOME } from "@/lib/auth-next"

export function RootRedirect() {
  const { session, loading } = useAuth()

  if (loading) return <FullScreenSpinner />
  return <Navigate to={session ? APP_HOME : "/log-in"} replace />
}
