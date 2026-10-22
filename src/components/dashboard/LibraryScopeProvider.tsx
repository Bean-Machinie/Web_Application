import { useMemo } from "react"
import type { ReactNode } from "react"
import { useAuth } from "@/auth/useAuth"
import { libraryScope } from "@/lib/world-scope"
import { WorldScopeContext } from "./WorldScopeContext"

// Gives what is inside it the signed-in person's library as the place the World
// components look at, so the new-entry dialog and the entry cards work outside the
// library's own pages, such as on Home.
export function LibraryScopeProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const userId = session?.user.id
  const scope = useMemo(() => (userId ? libraryScope(userId) : null), [userId])

  if (!scope) return null

  return <WorldScopeContext.Provider value={scope}>{children}</WorldScopeContext.Provider>
}
