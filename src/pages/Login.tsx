import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { AuthCard } from "@/components/auth/AuthCard"
import { CredentialsForm } from "@/components/auth/CredentialsForm"
import { FormAlert } from "@/components/auth/FormAlert"
import { supabase } from "@/lib/supabase"

export function Login() {
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const location = useLocation()
  // RequireAuth sends people here from the page they were trying to reach,
  // which is how an invite link survives the login.
  const from = (location.state as { from?: string } | null)?.from
  const destination = from?.startsWith("/app") ? from : "/app"

  async function handleSubmit(email: string, password: string) {
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      return
    }

    navigate(destination, { replace: true })
  }

  return (
    <AuthCard
      title="Welcome back"
      description="Log in with your email and password."
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="underline underline-offset-4">
            Sign up
          </Link>
        </>
      }
    >
      {error && <FormAlert tone="error">{error}</FormAlert>}
      <CredentialsForm submitLabel="Log in" onSubmit={handleSubmit} />
    </AuthCard>
  )
}
