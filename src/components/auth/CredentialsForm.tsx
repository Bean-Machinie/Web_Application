import { useState } from 'react'

type Props = {
  submitLabel: string
  onSubmit: (email: string, password: string) => Promise<void>
}

export function CredentialsForm({ submitLabel, onSubmit }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    await onSubmit(email, password)
    setBusy(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>
        <label htmlFor="email">Email</label>
        <br />
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </p>
      <p>
        <label htmlFor="password">Password</label>
        <br />
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </p>
      <button type="submit" disabled={busy}>
        {submitLabel}
      </button>
    </form>
  )
}
