import { useEffect, useRef } from "react"
import { AuthField } from "@/components/auth/AuthField"
import { SubmitButton } from "@/components/auth/SubmitButton"
import { PasswordField } from "@/components/dashboard/PasswordField"
import { PasswordStrength } from "@/components/dashboard/PasswordStrength"
import { Input } from "@/components/ui/input"
import { PASSWORD_MIN_LENGTH } from "@/lib/password-strength"

export type AccountValues = { username: string; email: string; password: string }

type Props = {
  values: AccountValues
  onChange: (field: keyof AccountValues, value: string) => void
  errors: Partial<Record<keyof AccountValues, string>>
  busy: boolean
  onSubmit: (event: React.FormEvent) => void
}

export function CreateAccountFields({ values, onChange, errors, busy, onSubmit }: Props) {
  const nameInput = useRef<HTMLInputElement>(null)

  useEffect(() => nameInput.current?.focus(), [])

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 p-1">
      <AuthField id="username" label="Display name" hint="Shown to your party" error={errors.username}>
        <Input
          ref={nameInput}
          id="username"
          autoComplete="username"
          spellCheck={false}
          required
          maxLength={50}
          value={values.username}
          onChange={(event) => onChange("username", event.target.value)}
          disabled={busy}
        />
      </AuthField>
      <AuthField id="email" label="Email" error={errors.email}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          value={values.email}
          onChange={(event) => onChange("email", event.target.value)}
          disabled={busy}
        />
      </AuthField>
      <AuthField
        id="password"
        label="Password"
        hint={`At least ${PASSWORD_MIN_LENGTH} characters. Mix cases, digits and symbols for a stronger one.`}
        error={errors.password}
      >
        <PasswordField
          id="password"
          label="Password"
          autoComplete="new-password"
          value={values.password}
          onChange={(value) => onChange("password", value)}
          disabled={busy}
        />
        <PasswordStrength password={values.password} minLength={PASSWORD_MIN_LENGTH} />
      </AuthField>
      <SubmitButton busy={busy}>Create account</SubmitButton>
    </form>
  )
}
