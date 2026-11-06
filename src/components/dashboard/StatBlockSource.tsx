import { Link } from "react-router-dom"
import { pageLabel } from "@/lib/rules-terms"

// "SRD 5.2.1, p. 290 · Licence".
export function StatBlockSource({ source }: { source: { document: string; page: number } }) {
  return (
    <p className="text-muted-foreground border-t pt-3 text-xs">
      {source.document}, {pageLabel([source.page])} ·{" "}
      <Link to="/app/legal#dnd-5e-2024" target="_blank" className="hover:text-foreground underline underline-offset-2">
        Licence
      </Link>
    </p>
  )
}
