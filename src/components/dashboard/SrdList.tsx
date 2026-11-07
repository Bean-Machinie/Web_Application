import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { ActionContextMenu } from "./ActionContextMenu"
import { ListRow } from "./ListRow"
import { openInNewTab } from "./openInNewTab"
import { useEntryPanel } from "./useEntryPanel"

// `tag` is left out where every row has the same one.
export type SrdRow = { id: string; to: string; title: string; tag?: string; summary: string; icon?: ReactNode }

// The list view of the SRD: a row each, with the title, its tag and a line of what it says.
export function SrdList({ rows, openId }: { rows: SrdRow[]; openId: string | null }) {
  const { openNew } = useEntryPanel()
  return (
    <ul className="flex flex-col">
      {rows.map((row) => (
        <li key={row.id}>
          <ActionContextMenu actions={openInNewTab(openNew, row.id)}>
          <ListRow asChild selected={openId === row.id}>
            <Link to={row.to} className="focus-visible:ring-ring gap-3 px-2 text-sm outline-none focus-visible:ring-2">
              {row.icon && <span className="text-muted-foreground shrink-0 [&_svg]:size-4">{row.icon}</span>}
              <span className="w-44 shrink-0 truncate font-medium">{row.title}</span>
              {row.tag && (
                <Badge variant="secondary" className="text-muted-foreground shrink-0 rounded-md">
                  {row.tag}
                </Badge>
              )}
              <span className="text-muted-foreground min-w-0 flex-1 truncate">{row.summary}</span>
            </Link>
          </ListRow>
          </ActionContextMenu>
        </li>
      ))}
    </ul>
  )
}
