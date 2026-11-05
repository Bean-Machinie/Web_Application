import type { ReactNode } from "react"
import type { GlossaryEntry } from "@/lib/character-templates/srd-5-2-1-glossary"

// What a rules hover card says about a term: what it is, and where the SRD says so.
export function GlossaryCardBody({ entry, footer }: { entry: GlossaryEntry; footer?: ReactNode }) {
  return (
    <>
      <div className="grid gap-1">
        <p className="font-medium">{entry.title}</p>
        <p className="text-muted-foreground">{entry.what}</p>
      </div>
      <p>
        <span className="text-muted-foreground">Used for: </span>
        {entry.use}
      </p>
      <p className="text-muted-foreground text-xs">SRD 5.2.1 p. {entry.page}</p>
      {footer}
    </>
  )
}
