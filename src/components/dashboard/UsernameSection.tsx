import { Input } from "@/components/ui/input"
import { USERNAME_HINT } from "@/lib/username"
import { SettingsHelp, SettingsRow } from "./SettingsRow"

type Props = {
  value: string
  onChange: (value: string) => void
  disabled: boolean
}

export function UsernameSection({ value, onChange, disabled }: Props) {
  return (
    <SettingsRow width="field" title="Username" description="Used to find and invite you.">
      <Input
        aria-label="Username"
        autoComplete="username"
        spellCheck={false}
        maxLength={50}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
      <SettingsHelp>{USERNAME_HINT}</SettingsHelp>
    </SettingsRow>
  )
}
