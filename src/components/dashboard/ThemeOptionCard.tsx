import { cn } from "@/lib/utils"
import type { Theme } from "@/theme/ThemeContext"

type Tone = "light" | "dark"

const tones: Record<Tone, { shell: string; bar: string; edge: string }> = {
  light: { shell: "bg-white", bar: "bg-zinc-200", edge: "border-zinc-200" },
  dark: { shell: "bg-zinc-900", bar: "bg-zinc-700", edge: "border-zinc-700" },
}

// A tiny app window drawn in fixed colors, so it looks the same in either theme.
function MiniWindow({ tone, className }: { tone: Tone; className?: string }) {
  const t = tones[tone]

  return (
    <div className={cn("absolute inset-0 flex", t.shell, className)}>
      <div className={cn("w-1/4 border-r p-1.5", t.edge)}>
        <div className={cn("h-1.5 w-full rounded-full", t.bar)} />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-2">
        <div className={cn("h-2 w-1/2 rounded-full", t.bar)} />
        <div className={cn("h-1.5 w-full rounded-full", t.bar)} />
        <div className={cn("h-1.5 w-4/5 rounded-full", t.bar)} />
      </div>
    </div>
  )
}

type Props = {
  value: Theme
  label: string
  selected: boolean
  onSelect: () => void
}

export function ThemeOptionCard({ value, label, selected, onSelect }: Props) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className="group flex cursor-pointer flex-col gap-2 text-left outline-none"
    >
      <div
        className={cn(
          "relative aspect-[4/3] overflow-hidden rounded-lg border transition-shadow group-focus-visible:ring-2 group-focus-visible:ring-offset-2",
          "group-focus-visible:ring-ring ring-offset-background",
          selected
            ? "border-primary ring-primary ring-2"
            : "group-hover:border-foreground/30"
        )}
      >
        <MiniWindow tone={value === "dark" ? "dark" : "light"} />
        {value === "system" && (
          <MiniWindow tone="dark" className="[clip-path:inset(0_0_0_50%)]" />
        )}
      </div>
      <span
        className={cn(
          "text-sm font-medium",
          selected ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {label}
      </span>
    </button>
  )
}
