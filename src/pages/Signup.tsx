import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CredentialsForm } from '@/components/auth/CredentialsForm'
import { supabase } from '@/lib/supabase'

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
      navigate('/app', { replace: true })
      return
    }

    setPending(true)
  }

  return (
    <main>
      <h1>Sign up</h1>
      {error && <p role="alert">{error}</p>}
      {pending && <p>Check your inbox to confirm your email address.</p>}
      <CredentialsForm submitLabel="Sign up" onSubmit={handleSubmit} />
      <p>
        <Link to="/login">Already have an account?</Link>
      </p>
    </main>
  )
}
