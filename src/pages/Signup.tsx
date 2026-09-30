import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { AuthCard } from "@/components/auth/AuthCard"
import { CredentialsForm } from "@/components/auth/CredentialsForm"
import { FormAlert } from "@/components/auth/FormAlert"
import { supabase } from "@/lib/supabase"

export function Signup() {
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(email: string, password: string) {
    setError(null)
    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      return
    }

    // No session means Supabase is waiting on email confirmation.
    if (data.session) {
      navigate("/app", { replace: true })
      return
    }

    setPending(true)
  }

  return (
    <AuthCard
      title="Create an account"
      description="Sign up with your email and a password."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="underline underline-offset-4">
            Log in
          </Link>
        </>
      }
    >
      {error && <FormAlert tone="error">{error}</FormAlert>}
      {pending && (
        <FormAlert tone="success">
          Check your inbox to confirm your email address.
        </FormAlert>
      )}
      <CredentialsForm submitLabel="Sign up" onSubmit={handleSubmit} />
    </AuthCard>
  )
}
