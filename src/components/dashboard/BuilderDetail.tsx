import type { ReactNode } from "react"

type Props = {
  // A small word over the title: "Class", "Background".
  kind: string
  title: string
  intro?: string
  // Where the SRD says so, like "Fighter, p. 47".
  source?: string
  children?: ReactNode
}

// The panel for the chosen option: its name, a sentence on it, the details, and at the
// bottom where the SRD says so.
export function BuilderDetail({ kind, title, intro, source, children }: Props) {
  return (
    <section className="flex flex-col gap-7 p-7">
      <div className="grid gap-1">
        <span className="text-muted-foreground text-xs">{kind}</span>
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {intro && <p className="text-muted-foreground max-w-xl text-sm">{intro}</p>}
      </div>
      {children}
      {source && <p className="text-muted-foreground text-xs">SRD 5.2.1 · {source}</p>}
    </section>
  )
}
