import type { ReactNode } from "react"
import { Link, useNavigate } from "react-router-dom"
import blackName from "@/assets/logo/Black/HELIOSYN_Name_Black.png"
import whiteName from "@/assets/logo/White/HELIOSYN_Name_White.png"
import { Button } from "@/components/ui/button"
import { LogoMark } from "@/components/LogoMark"
import { useAuth } from "@/auth/useAuth"
import { supabase } from "@/lib/supabase"

// For screens shown before there is a campaign, so there is no sidebar and
// therefore no account menu. The header keeps a way to log out.
export function FullScreenLayout({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await supabase.auth.signOut()
    navigate("/login", { replace: true })
  }

  return (
    <div className="flex min-h-svh flex-col">
      <header className="flex h-16 items-center justify-between px-4 sm:px-6">
        <Link
          to={session ? "/app" : "/"}
          aria-label="Heliosyn home"
          className="flex items-center gap-1"
        >
          <LogoMark className="size-9" />
          <img draggable={false} src={blackName} alt="" className="h-8 dark:hidden" />
          <img draggable={false} src={whiteName} alt="" className="hidden h-8 dark:block" />
        </Link>
        {session && (
          <div className="flex items-center gap-3">
            <span className="text-muted-foreground hidden text-sm sm:inline">
              {session.user.email}
            </span>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              Log out
            </Button>
          </div>
        )}
      </header>
      <main className="flex flex-1 items-center justify-center p-6 pb-24">
        {children}
      </main>
    </div>
  )
}
