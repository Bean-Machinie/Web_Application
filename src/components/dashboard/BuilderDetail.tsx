import type { ReactNode } from "react"

type Props = {
  title: string
  // What this is, in a sentence.
  intro?: string
  // The SRD page the explanation comes from.
  page?: number
  children?: ReactNode
}

// The panel for the chosen option: its name, a sentence on it, the details, and at the
// bottom where the SRD says so.
export function BuilderDetail({ title, intro, page, children }: Props) {
  return (
    <section className="flex min-h-full flex-col gap-4 p-5">
      <div className="grid gap-1">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {intro && <p className="text-muted-foreground text-sm">{intro}</p>}
      </div>
      <div className="grid gap-3">{children}</div>
      {page !== undefined && <p className="text-muted-foreground mt-auto pt-2 text-xs">SRD 5.2.1 p. {page}</p>}
    </section>
  )
}
