import { Link } from "react-router-dom"
import { entrySourcePath } from "@/lib/entry-source"
import type { EntrySource } from "@/lib/entry-source"

// The one line saying where an entry came from, linking to the original.
export function EntrySourceLine({ source }: { source: EntrySource | null }) {
  if (!source) return null
  return (
    <Link to={entrySourcePath(source)} className="text-muted-foreground hover:text-foreground w-fit text-sm underline underline-offset-2">
      {source.label}
    </Link>
  )
}
