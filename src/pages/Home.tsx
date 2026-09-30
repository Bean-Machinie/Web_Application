import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/auth/useAuth"

export function Home() {
  const { session } = useAuth()

  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Web Application
        </h1>
        <p className="text-muted-foreground">
          A dashboard shell built with React, Supabase and shadcn/ui.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {session ? (
          <Button asChild>
            <Link to="/app">
              Open dashboard
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild>
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/signup">Sign up</Link>
            </Button>
          </>
        )}
      </div>
    </main>
  )
}
