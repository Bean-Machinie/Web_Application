import { Check } from "lucide-react"
import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { BUILDER_SCROLL } from "./builder-scroll"

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

// A step with one choice to make: the options in a card on the left, the name and a muted
// line each, and the chosen one explained in a card beside it. Picking an option is choosing
// it, and it is saved at once. Both sit directly in the builder's row, so they share its height.
// Below 1100px the list is a row of chips above the detail.
export function BuilderLayout({ heading, options, selected, onSelect, hint, children }: Props) {
  return (
    <>
      <section aria-label={heading} className="bg-card hidden w-[260px] shrink-0 flex-col overflow-hidden rounded-lg border shadow-xs min-[1100px]:flex">
        <h2 className="flex h-11 shrink-0 items-center border-b px-4 text-sm font-semibold">{heading}</h2>
        <div className={cn("flex min-h-0 flex-1 flex-col gap-0.5 p-2", BUILDER_SCROLL)}>
          {options.map((option) => (
            <button
              key={option.id}
              type="button"
              aria-pressed={option.id === selected}
              onClick={() => onSelect(option.id)}
              className={cn(
                "hover:bg-accent focus-visible:ring-ring flex h-[52px] w-full shrink-0 items-center gap-2 rounded-md px-2 text-left outline-none focus-visible:ring-2",
                option.id === selected && "bg-accent"
              )}
            >
              <span className="flex size-4 shrink-0 items-center justify-center">{option.id === selected && <Check className="size-4" />}</span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">{option.name}</span>
                  {option.badge && <Badge variant="secondary" className="h-5">{option.badge}</Badge>}
                </span>
                <span className="text-muted-foreground truncate text-xs">{option.line}</span>
              </span>
            </button>
          ))}
          {hint && <p className="text-muted-foreground mt-3 px-2 text-xs">{hint}</p>}
        </div>
      </section>
      <div aria-label={heading} className={cn("-mb-1 flex shrink-0 gap-2 pb-1 min-[1100px]:hidden", BUILDER_SCROLL)}>
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            aria-pressed={option.id === selected}
            onClick={() => onSelect(option.id)}
            className={cn(
              "hover:bg-accent focus-visible:ring-ring h-8 shrink-0 rounded-full border px-3 text-sm outline-none focus-visible:ring-2",
              option.id === selected && "bg-accent border-foreground/40 font-medium"
            )}
          >
            {option.name}
          </button>
        ))}
      </div>
      <div className={cn("bg-card min-w-0 rounded-lg border shadow-xs min-[1100px]:min-h-0 min-[1100px]:flex-1", BUILDER_SCROLL)}>{children}</div>
    </>
  )
}
