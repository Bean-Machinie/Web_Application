import type { ReactNode } from "react"
import { pageLabel } from "@/lib/rules-terms"
import type { RuleEntry } from "@/lib/srd-rules-types"

// What a rules hover card says about a term: what it is, and where the SRD says so.
export function GlossaryCardBody({ entry, footer }: { entry: RuleEntry; footer?: ReactNode }) {
  return (
    <>
      <div className="grid gap-1">
        <p className="font-medium">{entry.title}</p>
        <p className="text-muted-foreground">{entry.summary}</p>
      </div>
      <p className="text-muted-foreground text-xs">SRD 5.2.1, {pageLabel(entry.pages)}</p>
      {footer}
    </>
  )
}
