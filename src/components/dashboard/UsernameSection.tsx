import { Input } from "@/components/ui/input"
import { USERNAME_HINT } from "@/lib/username"
import { SettingsRow } from "./SettingsRow"

type Props = {
  value: string
  onChange: (value: string) => void
  disabled: boolean
}

export function UsernameSection({ value, onChange, disabled }: Props) {
  return (
    <SettingsRow
      wide
      title="Username"
      description="Your name across the app. It's also how people find you to invite you to a campaign."
    >
      <div className="grid gap-2">
        <Input
          aria-label="Username"
          autoComplete="username"
          spellCheck={false}
          maxLength={50}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
        />
        <p className="text-muted-foreground text-xs">{USERNAME_HINT}</p>
      </div>
    </SettingsRow>
  )
}
