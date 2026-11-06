import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type SrdRow = { id: string; to: string; title: string; tag: string; summary: string; icon?: ReactNode }

// The list view of the SRD: a row each, with the title, its tag and a line of what it says.
export function SrdList({ rows, openId }: { rows: SrdRow[]; openId: string | null }) {
  return (
    <ul className="flex flex-col">
      {rows.map((row) => (
        <li key={row.id}>
          <Link
            to={row.to}
            className={cn(
              "hover:bg-accent/50 focus-visible:ring-ring flex h-11 items-center gap-3 rounded-md px-3 text-sm outline-none focus-visible:ring-2",
              openId === row.id && "bg-primary/10 hover:bg-primary/10"
            )}
          >
            {row.icon && <span className="text-muted-foreground shrink-0 [&_svg]:size-4">{row.icon}</span>}
            <span className="w-44 shrink-0 truncate font-medium">{row.title}</span>
            <Badge variant="secondary" className="text-muted-foreground shrink-0 rounded-md">
              {row.tag}
            </Badge>
            <span className="text-muted-foreground min-w-0 flex-1 truncate">{row.summary}</span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
