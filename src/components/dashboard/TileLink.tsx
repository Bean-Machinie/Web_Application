import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { ArrowRight } from "lucide-react"

// A quiet text link with an arrow, for a Home tile's second way on.
export function TileLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="text-muted-foreground hover:text-foreground focus-visible:ring-ring flex items-center gap-1 rounded-sm text-sm outline-none transition-colors focus-visible:ring-2">
      {children}
      <ArrowRight className="size-4" />
    </Link>
  )
}
