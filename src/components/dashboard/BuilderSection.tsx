import type { ReactNode } from "react"

// A small capitalised heading over a group of rows.
export function BuilderSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="grid gap-0">
      <h3 className="text-muted-foreground pb-1 text-xs font-semibold tracking-wide uppercase">{title}</h3>
      {children}
    </div>
  )
}
