import { useMemo } from "react"
import { Outlet } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { libraryScope } from "@/lib/world-scope"
import { WorldScopeContext } from "./WorldScopeContext"

// Gives the pages below it the signed-in person's library. It needs no
// campaign, so it sits outside RequireCampaign.
export function LibraryWorldScope() {
  const { session } = useAuth()
  const userId = session?.user.id
  const scope = useMemo(() => (userId ? libraryScope(userId) : null), [userId])

  if (!scope) return null

  return (
    <WorldScopeContext.Provider value={scope}>
      <Outlet />
    </WorldScopeContext.Provider>
  )
}
