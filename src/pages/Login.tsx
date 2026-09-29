import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CredentialsForm } from '@/components/auth/CredentialsForm'
import { supabase } from '@/lib/supabase'

export function Login() {
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

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

    navigate('/app', { replace: true })
  }

  return (
    <main>
      <h1>Log in</h1>
      {error && <p role="alert">{error}</p>}
      <CredentialsForm submitLabel="Log in" onSubmit={handleSubmit} />
      <p>
        <Link to="/signup">Create an account</Link>
      </p>
    </main>
  )
}
