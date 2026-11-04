import { FileText } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { INDENT_PX } from "@/lib/journal-drop"
import { guidesFor } from "@/lib/journal-tree"
import type { TemplatePage } from "@/lib/campaign-template-types"
import { IndentGuides } from "./IndentGuides"

type Row = { page: TemplatePage; depth: number }

function rowsOf(pages: TemplatePage[], depth = 0): Row[] {
  return pages.flatMap((page) => [{ page, depth }, ...rowsOf(page.children ?? [], depth + 1)])
}

// The pages the journal starts with, as the tree will look, to read and not to change. A
// page players cannot see yet says so.
export function TemplateJournalPreview({ pages }: { pages: TemplatePage[] }) {
  const rows = rowsOf(pages)

  return (
    <div className="bg-card min-h-0 flex-1 overflow-y-auto rounded-lg border p-2">
      <ul aria-label="Journal pages" className="mx-auto flex max-w-2xl flex-col">
        {rows.map(({ page, depth }, index) => (
          <li key={index} className="relative" style={{ paddingLeft: depth * INDENT_PX }}>
            <IndentGuides guides={guidesFor(rows, index)} />
            <div className="flex h-7 items-center gap-2 rounded-md px-2">
              <FileText className="text-muted-foreground size-4 shrink-0" />
              <span className={depth > 0 ? "text-muted-foreground min-w-0 flex-1 truncate text-sm" : "min-w-0 flex-1 truncate text-sm"}>
                {page.title}
              </span>
              <Badge variant={page.revealed ? "default" : "secondary"}>{page.revealed ? "Players" : "GM only"}</Badge>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
