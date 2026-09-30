import { useState } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { USERNAME_HINT } from "@/lib/username"

type Props = {
  submitLabel: string
  // Asks for a username too, for sign-up.
  withUsername?: boolean
  onSubmit: (
    email: string,
    password: string,
    username: string
  ) => Promise<void>
}

export function CredentialsForm({ submitLabel, withUsername, onSubmit }: Props) {
  const [email, setEmail] = useState("")
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    try {
      await onSubmit(email, password, username)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={busy}
        />
      </div>
      {withUsername && (
        <div className="grid gap-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            required
            maxLength={20}
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            disabled={busy}
          />
          <p className="text-muted-foreground text-xs">{USERNAME_HINT}</p>
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete={withUsername ? "new-password" : "current-password"}
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={busy}
        />
      </div>
      <Button type="submit" className="w-full" disabled={busy}>
        {busy && <Loader2 className="size-4 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  )
}
