import { SettingsSection } from "@/components/dashboard/SettingsSection"
import { ThemeOptionCard } from "@/components/dashboard/ThemeOptionCard"
import { useTheme } from "@/theme/useTheme"
import type { Theme } from "@/theme/ThemeContext"

const options: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

export function SettingsAppearance() {
  const { theme, setTheme } = useTheme()

  return (
    <SettingsSection
      title="Interface theme"
      description="Choose how the workspace looks on this device."
    >
      <div
        role="radiogroup"
        aria-label="Interface theme"
        className="grid grid-cols-3 gap-3 sm:gap-4"
      >
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
    </SettingsSection>
  )
}
