import { SettingsCard } from "@/components/dashboard/SettingsCard"
import { SettingsRow } from "@/components/dashboard/SettingsRow"
import { ThemeOptionCard } from "@/components/dashboard/ThemeOptionCard"
import { useTheme } from "@/theme/useTheme"
import type { Theme } from "@/theme/ThemeContext"

const options: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

// The theme applies as soon as it is picked, so this tab never raises the save bar.
export function SettingsAppearance() {
  const { theme, setTheme } = useTheme()

  return (
    <SettingsCard>
      <SettingsRow width="wide" title="Theme" description="System follows your device.">
        <div role="radiogroup" aria-label="Interface theme" className="grid grid-cols-3 gap-3">
          {options.map((option) => (
            <ThemeOptionCard
              key={option.value}
              value={option.value}
              label={option.label}
              selected={theme === option.value}
              onSelect={() => setTheme(option.value)}
            />
          ))}
        </div>
      </SettingsRow>
    </SettingsCard>
  )
}
