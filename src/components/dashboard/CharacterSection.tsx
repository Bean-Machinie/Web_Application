import type { ReactNode } from "react"
import { ChevronRight } from "lucide-react"
import type { TemplateSection } from "@/lib/character-templates/types"

type Props = {
  section: TemplateSection
  // How many fields it has, for the summary when the template gives none.
  count: number
  open: boolean
  onOpen: () => void
  children: ReactNode
}

// A part of a tab. Until something is in it, it is one row, "Ability scores · 6 scores ·
// Set up", and the whole row opens it. Once it has a value it stays open as its heading
// over its fields.
export function CharacterSection({ section, count, open, onOpen, children }: Props) {
  if (!open) {
    return (
      <button
        type="button"
        onClick={onOpen}
        className="bg-card hover:bg-accent/50 focus-visible:ring-ring flex min-h-12 w-full items-center gap-2 rounded-lg border px-4 py-3 text-left shadow-xs outline-none focus-visible:ring-2 sm:px-5"
      >
        <span className="text-sm font-medium">{section.label}</span>
        <span className="text-muted-foreground min-w-0 flex-1 truncate text-sm">
          · {section.summary ?? `${count} ${count === 1 ? "field" : "fields"}`}
        </span>
        <span className="text-muted-foreground flex shrink-0 items-center gap-1 text-sm">
          Set up
          <ChevronRight className="size-4" />
        </span>
      </button>
    )
  }

  return (
    <section className="flex flex-col gap-2">
      <h3 className="text-muted-foreground text-xs font-medium">{section.label}</h3>
      {children}
    </section>
  )
}
