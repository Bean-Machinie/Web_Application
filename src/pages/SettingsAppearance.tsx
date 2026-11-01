import { SettingsGroup } from "@/components/dashboard/SettingsGroup"
import { SettingsRow } from "@/components/dashboard/SettingsRow"
import { ThemeOptionCard } from "@/components/dashboard/ThemeOptionCard"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { useBackground } from "@/theme/useBackground"
import { useTheme } from "@/theme/useTheme"
import type { Background } from "@/theme/BackgroundContext"
import type { Theme } from "@/theme/ThemeContext"

const options: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

const backgrounds: { value: Background; label: string }[] = [
  { value: "animated", label: "Animated" },
  { value: "still", label: "Still" },
  { value: "off", label: "Off" },
]

// The theme and the background apply as soon as they are picked, so this tab never raises the save bar.
export function SettingsAppearance() {
  const { theme, setTheme } = useTheme()
  const { background, setBackground } = useBackground()

  return (
    <>
      <SettingsGroup title="Theme">
        <SettingsRow width="wide" title="Interface theme" description="System follows your device.">
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
      </SettingsGroup>
      <SettingsGroup title="Background">
        <SettingsRow
          width="wide"
          center
          title="Style"
          description="Dark theme only. Animated shows still if your device asks for less motion."
        >
          <SegmentedControl aria-label="Background" value={background} onValueChange={setBackground} options={backgrounds} />
        </SettingsRow>
      </SettingsGroup>
    </>
  )
}
