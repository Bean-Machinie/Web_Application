import { CircleOff, Image, Sparkles } from "lucide-react"
import { RadioGroup } from "radix-ui"
import { DiceStylePicker } from "@/components/dashboard/DiceStylePicker"
import { SettingsHelp, SettingsRow } from "@/components/dashboard/SettingsRow"
import { ThemeOptionCard } from "@/components/dashboard/ThemeOptionCard"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { useReducedMotion } from "@/hooks/use-reduced-motion"
import { useBackground } from "@/theme/useBackground"
import { useTheme } from "@/theme/useTheme"
import type { Background } from "@/theme/BackgroundContext"
import type { Theme } from "@/theme/ThemeContext"

const options: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
]

const backgrounds: { value: Background; label: string; icon: React.ReactNode }[] = [
  { value: "animated", label: "Animated", icon: <Sparkles /> },
  { value: "still", label: "Still", icon: <Image /> },
  { value: "off", label: "Off", icon: <CircleOff /> },
]

// The theme and the background apply as soon as they are picked, so this tab never raises the save bar.
export function SettingsAppearance() {
  const { theme, setTheme, resolved } = useTheme()
  const { background, setBackground } = useBackground()
  const reducedMotion = useReducedMotion()
  const lightTheme = resolved === "light"

  return (
    <div className="divide-y">
      <SettingsRow width="wide" title="Interface theme" description="Select or customise your theme.">
        <RadioGroup.Root
          aria-label="Interface theme"
          value={theme}
          onValueChange={(next) => setTheme(next as Theme)}
          className="grid grid-cols-3 gap-3"
        >
          {options.map((option) => (
            <ThemeOptionCard key={option.value} value={option.value} label={option.label} />
          ))}
        </RadioGroup.Root>
      </SettingsRow>
      <SettingsRow width="wide" title="Background" description="A slow, subtle pattern behind your pages.">
        <SegmentedControl
          aria-label="Background"
          value={background}
          onValueChange={setBackground}
          options={backgrounds}
          disabled={lightTheme}
        />
        {lightTheme ? (
          <SettingsHelp>Only shown in dark theme.</SettingsHelp>
        ) : (
          reducedMotion && <SettingsHelp>Your device prefers reduced motion, so Animated shows as Still.</SettingsHelp>
        )}
      </SettingsRow>
      <SettingsRow width="wide" title="Dice" description="The look of the dice you roll.">
        <DiceStylePicker />
      </SettingsRow>
    </div>
  )
}
