import { cn } from "@/lib/utils"
import { useActiveSection } from "./useActiveSection"

export type TocItem = { id: string; label: string; indent?: boolean }

// Hidden below 1000px, where the page is only the reading column.
export function LegalToc({ items }: { items: TocItem[] }) {
  const active = useActiveSection(items.map((item) => item.id))

  return (
    <nav aria-label="On this page" className="sticky top-[calc(var(--header-height)+1.5rem)] hidden w-44 shrink-0 self-start max-[999px]:hidden min-[1000px]:block">
      <ul className="flex flex-col gap-2 text-sm">
        {items.map((item) => (
          <li key={item.id} className={cn(item.indent && "pl-3")}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={cn(
                "transition-colors",
                active === item.id ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
