import { RadioGroup } from "radix-ui"
import { Check } from "lucide-react"
import { ThemeMock } from "@/components/dashboard/ThemeMock"
import type { Theme } from "@/theme/ThemeContext"

type Props = { value: Theme; label: string }

// One radio card of the theme picker. System shows light and dark split along the diagonal.
export function ThemeOptionCard({ value, label }: Props) {
  return (
    <RadioGroup.Item value={value} className="group flex cursor-pointer flex-col gap-2 text-left outline-none">
      <div className="border-border group-hover:border-foreground/30 group-focus-visible:ring-ring ring-offset-background group-data-[state=checked]:border-primary group-data-[state=checked]:ring-primary relative aspect-[4/3] w-full overflow-hidden rounded-lg border transition-shadow group-focus-visible:ring-2 group-focus-visible:ring-offset-2 group-data-[state=checked]:ring-2">
        <ThemeMock tone={value === "dark" ? "dark" : "light"} />
        {value === "system" && <ThemeMock tone="dark" className="[clip-path:polygon(100%_0,100%_100%,0_100%)]" />}
        <span className="bg-primary text-primary-foreground absolute top-1.5 right-1.5 hidden size-4 items-center justify-center rounded-full group-data-[state=checked]:flex">
          <Check className="size-3" strokeWidth={3} />
        </span>
      </div>
      <span className="text-sm font-medium">{label}</span>
    </RadioGroup.Item>
  )
}
