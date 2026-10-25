import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export type BuilderOption = { id: string; name: string; line: string }

type Props = {
  options: BuilderOption[]
  selected: string | null
  onSelect: (id: string) => void
  children: ReactNode
}

// A step with a choice to make: the options in a column on the left, about 180px wide with
// the name and one muted line each, and the chosen one explained on the right. Picking an
// option is choosing it; it is saved at once.
export function BuilderLayout({ options, selected, onSelect, children }: Props) {
  return (
    <div className="flex h-full min-h-0 gap-4">
      <ul className="flex w-[180px] shrink-0 flex-col gap-1 overflow-y-auto pr-1" aria-label="Options">
        {options.map((option) => (
          <li key={option.id}>
            <button
              type="button"
              aria-pressed={option.id === selected}
              onClick={() => onSelect(option.id)}
              className={cn(
                "hover:bg-accent focus-visible:ring-ring flex w-full flex-col rounded-lg border border-transparent px-3 py-2 text-left outline-none focus-visible:ring-2",
                option.id === selected && "bg-accent border-border"
              )}
            >
              <span className="text-sm font-medium">{option.name}</span>
              <span className="text-muted-foreground truncate text-xs">{option.line}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="bg-card min-w-0 flex-1 overflow-y-auto rounded-lg border shadow-xs">{children}</div>
    </div>
  )
}
