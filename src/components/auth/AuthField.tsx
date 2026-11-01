import type { ReactNode } from "react"
import { FormAlert } from "@/components/auth/FormAlert"
import { Label } from "@/components/ui/label"

type Props = {
  id: string
  label: string
  // Sits to the right of the label, e.g. "Forgot password?".
  aside?: ReactNode
  // Muted help under the field, always shown.
  hint?: string
  error?: string
  children: ReactNode
}

export function AuthField({ id, label, aside, hint, error, children }: Props) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        {aside}
      </div>
      {children}
      {hint && <p className="text-muted-foreground text-[13px]">{hint}</p>}
      {error && <FormAlert tone="error">{error}</FormAlert>}
    </div>
  )
}
