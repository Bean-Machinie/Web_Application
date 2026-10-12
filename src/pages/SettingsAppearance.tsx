import { SettingsCard } from "@/components/dashboard/SettingsCard"
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
      <div className="p-4 sm:p-5">
        <h4 className="text-sm font-medium">Interface theme</h4>
        <p className="text-muted-foreground mt-0.5 mb-4 text-sm">
          System follows your device and switches with it.
        </p>
        <div role="radiogroup" aria-label="Interface theme" className="grid grid-cols-3 gap-3 sm:gap-4">
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
      </div>
    </SettingsCard>
  )
}
