import { LIBRARY_SECTIONS, countIn } from "@/lib/library-sections"
import type { LibrarySection } from "@/lib/library-sections"
import type { WorldEntry } from "@/lib/world-entries"
import { cn } from "@/lib/utils"

type Props = {
  entries: WorldEntry[] | null
  active: string
  onChange: (id: string) => void
  // On a phone: one row of chips to swipe along, nested sections flattened.
  compact?: boolean
  // Sections of things that are not entries, listed after the others with their own counts.
  extra?: { section: LibrarySection; count: number | null }[]
}

type RowProps = Props & { section: LibrarySection; depth: number; count?: number | null }

function Row({ section, entries, active, onChange, depth, count }: RowProps) {
  const Icon = section.icon
  const selected = active === section.id

  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={() => onChange(section.id)}
      className={cn(
        "focus-visible:ring-ring flex shrink-0 items-center gap-2.5 rounded-lg py-1.5 pr-3 text-sm font-medium whitespace-nowrap outline-none transition-colors focus-visible:ring-2",
        depth === 0 ? "pl-3" : "pl-3 text-[13px]",
        selected
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      <Icon className="size-4 shrink-0" />
      {section.label}
      <span className="ml-auto pl-2 text-xs tabular-nums opacity-70">{count !== undefined ? count : countIn(section, entries)}</span>
    </button>
  )
}

// The library's sections, in a column beside it (the same one in the page and in
// "Add from your library"): All, Maps, and World entries with its kinds nested
// under it. A section with nothing in it still shows, so the shape never changes.
export function LibrarySections(props: Props) {
  if (props.compact) {
    return (
      <div role="tablist" aria-label="Section" className="no-scrollbar -m-1 flex min-w-0 gap-1 overflow-x-auto p-1">
        {LIBRARY_SECTIONS.flatMap((section) => [section, ...(section.children ?? [])]).map((section) => (
          <Row key={section.id} {...props} section={section} depth={0} />
        ))}
        {props.extra?.map(({ section, count }) => (
          <Row key={section.id} {...props} section={section} depth={0} count={count} />
        ))}
      </div>
    )
  }

  return (
    <div role="tablist" aria-label="Section" aria-orientation="vertical" className="-m-1 flex w-48 shrink-0 flex-col gap-0.5 p-1">
      {LIBRARY_SECTIONS.map((section) => (
        <div key={section.id} className="flex flex-col gap-0.5">
          <Row {...props} section={section} depth={0} />
          {section.children && (
            <div className="border-border ml-5 flex flex-col gap-0.5 border-l pl-1.5">
              {section.children.map((child) => (
                <Row key={child.id} {...props} section={child} depth={1} />
              ))}
            </div>
          )}
        </div>
      ))}
      {props.extra?.map(({ section, count }) => (
        <Row key={section.id} {...props} section={section} depth={0} count={count} />
      ))}
    </div>
  )
}
