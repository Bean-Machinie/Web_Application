import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"

type Props = {
  title: string
  // Who asks for it: a class, a background, a species.
  source?: string
  // "Done", or "1 of 2 chosen".
  status: string
  help?: string
  className?: string
  children: ReactNode
}

// The frame of one choice: its name, who asks for it, how many are chosen, and a line of
// help.
export function BuilderChoiceCard({ title, source, status, help, className, children }: Props) {
  return (
    <section aria-label={title} className={`bg-card flex min-w-0 flex-col gap-3 rounded-lg border p-5 shadow-xs ${className ?? ""}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <h2 className="text-base font-semibold">{title}</h2>
          {source && <Badge variant="secondary">{source}</Badge>}
        </span>
        <span className="text-muted-foreground text-sm">{status}</span>
      </div>
      {help && <p className="text-muted-foreground -mt-1 text-xs">{help}</p>}
      {children}
    </section>
  )
}
