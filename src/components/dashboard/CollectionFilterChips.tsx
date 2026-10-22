import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export type FilterChip = { label: string; onRemove: () => void }

// The filters that are on, each one removable. Nothing at all while none is.
export function CollectionFilterChips({ chips }: { chips: FilterChip[] }) {
  return (
    <ul aria-label="Active filters" className="flex flex-wrap items-center gap-1.5">
      {chips.map((chip) => (
        <li key={chip.label}>
          <Badge variant="secondary" className="gap-1 pr-1">
            {chip.label}
            <button
              type="button"
              aria-label={`Remove filter: ${chip.label}`}
              onClick={chip.onRemove}
              className="hover:bg-foreground/10 focus-visible:ring-ring flex size-4 items-center justify-center rounded-full outline-none focus-visible:ring-2"
            >
              <X className="size-3" />
            </button>
          </Badge>
        </li>
      ))}
    </ul>
  )
}
