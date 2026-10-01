import { LayoutGrid, List } from "lucide-react"
import type { WorldViewMode } from "@/hooks/use-world-view-mode"
import { cn } from "@/lib/utils"

const OPTIONS = [
  { mode: "list", label: "List view", icon: List },
  { mode: "grid", label: "Grid view", icon: LayoutGrid },
] as const

type Props = { mode: WorldViewMode; onChange: (mode: WorldViewMode) => void }

// A small segmented control: one button per view, the active one raised.
export function WorldViewToggle({ mode, onChange }: Props) {
  return (
    <div role="group" aria-label="View" className="bg-muted inline-flex rounded-lg p-0.5">
      {OPTIONS.map(({ mode: option, label, icon: OptionIcon }) => (
        <button
          key={option}
          type="button"
          aria-label={label}
          aria-pressed={mode === option}
          onClick={() => onChange(option)}
          className={cn(
            "focus-visible:ring-ring flex size-7 items-center justify-center rounded-md transition-colors outline-none focus-visible:ring-2",
            mode === option
              ? "bg-background text-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <OptionIcon className="size-4" />
        </button>
      ))}
    </div>
  )
}
