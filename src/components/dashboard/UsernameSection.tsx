import { Input } from "@/components/ui/input"
import { SettingsHelp, SettingsRow } from "./SettingsRow"

type Props = {
  value: string
  onChange: (value: string) => void
  disabled: boolean
}

export function UsernameSection({ value, onChange, disabled }: Props) {
  return (
    <SettingsRow center width="wide" title="Username">
      <Input
        aria-label="Username"
        autoComplete="username"
        spellCheck={false}
        maxLength={50}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
      />
      <SettingsHelp>2–50 characters, no @</SettingsHelp>
    </SettingsRow>
  )
}
