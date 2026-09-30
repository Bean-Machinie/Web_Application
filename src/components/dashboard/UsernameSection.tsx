import { Input } from "@/components/ui/input"
import { USERNAME_HINT } from "@/lib/username"
import { SettingsSection } from "./SettingsSection"

type Props = {
  value: string
  onChange: (value: string) => void
  // True until the saved username has loaded, or while saving.
  disabled: boolean
}

export function UsernameSection({ value, onChange, disabled }: Props) {
  return (
    <SettingsSection
      title="Username"
      description="Lets people find you to invite you to a campaign."
    >
      <div className="grid gap-2">
        <div className="relative">
          <span className="text-muted-foreground pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm">
            @
          </span>
          <Input
            aria-label="Username"
            autoComplete="username"
            autoCapitalize="none"
            spellCheck={false}
            maxLength={20}
            className="pl-7"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            disabled={disabled}
          />
        </div>
        <p className="text-muted-foreground text-xs">{USERNAME_HINT}</p>
      </div>
    </SettingsSection>
  )
}
