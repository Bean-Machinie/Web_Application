import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import type { TemplateSection } from "@/lib/character-templates/types"

type Props = {
  section: TemplateSection
  // How many fields it has, for the preview when the template gives none.
  count: number
  open: boolean
  // A line under the heading, like how many skills to choose.
  caption?: string | null
  // A helper that opens beside the heading.
  action?: ReactNode
  onOpen: () => void
  children: ReactNode
}

// A part of a tab. Until something is in it, it is a compact card: the title, a muted
// line on what is inside ("6 scores"), and a Set up button on the right; the card as a
// whole opens it too. Once it has a value it stays open, in place, as its heading over its
// fields.
export function CharacterSection({ section, count, open, caption, action, onOpen, children }: Props) {
  if (!open) {
    return (
      <div
        onClick={onOpen}
        className="bg-card hover:bg-accent/30 flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 shadow-xs transition-colors"
      >
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-sm font-medium">{section.label}</span>
          <span className="text-muted-foreground truncate text-xs">
            {section.summary ?? `${count} ${count === 1 ? "field" : "fields"}`}
          </span>
        </div>
        <Button variant="outline" size="sm" className="shrink-0">
          Set up
        </Button>
      </div>
    )
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-muted-foreground text-xs font-medium">{section.label}</h3>
        {action}
      </div>
      {caption && <p className="text-muted-foreground -mt-1 text-xs">{caption}</p>}
      {children}
    </section>
  )
}
