import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type BuilderOption = { id: string; name: string; line: string; badge?: string }

type Props = {
  heading: string
  options: BuilderOption[]
  selected: string | null
  onSelect: (id: string) => void
  // Under the list, a hint.
  hint?: string
  children: ReactNode
}

// A step with one choice to make: the options in a column on the left, the name and a muted
// line each, and the chosen one explained on the right. Picking an option is choosing it,
// and it is saved at once.
export function BuilderLayout({ heading, options, selected, onSelect, hint, children }: Props) {
  return (
    <div className="flex min-w-0 flex-1 flex-wrap items-start gap-6">
      <section aria-label={heading} className="flex w-[236px] shrink-0 flex-col gap-0.5">
        <span className="text-muted-foreground px-3 pb-1.5 text-xs">{heading}</span>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={option.id === selected}
            onClick={() => onSelect(option.id)}
            className={cn(
              "hover:bg-accent focus-visible:ring-ring flex w-full flex-col rounded-lg border border-transparent px-3 py-2 text-left outline-none focus-visible:ring-2",
              option.id === selected && "bg-accent border-border"
            )}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{option.name}</span>
              {option.badge && <Badge variant="secondary" className="h-5">{option.badge}</Badge>}
            </span>
            <span className="text-muted-foreground truncate text-xs">{option.line}</span>
          </button>
        ))}
        {hint && <p className="text-muted-foreground mt-3 px-3 text-xs">{hint}</p>}
      </section>
      <div className="bg-card min-w-0 flex-[999_1_480px] rounded-lg border shadow-xs">{children}</div>
    </div>
  )
}
