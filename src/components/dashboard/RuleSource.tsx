import { Link } from "react-router-dom"
import { pageLabel } from "@/lib/rules-terms"

// The line under a term that stays at the bottom of its pane: where in the SRD it comes from, and
// the licence it is shared under.
export function RuleSource({ pages }: { pages: number[] }) {
  return (
    <footer className="bg-background text-muted-foreground shrink-0 border-t px-6 py-3 text-xs md:px-10">
      SRD 5.2.1, {pageLabel(pages)} ·{" "}
      <Link to="/app/legal#dnd-5e-2024" target="_blank" className="hover:text-foreground underline underline-offset-2">
        Licence
      </Link>
    </footer>
  )
}
