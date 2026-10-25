import type { ReactNode } from "react"

// A label and its value, in a row.
export function BuilderRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-8 items-start gap-3 text-sm">
      <div className="text-muted-foreground w-32 shrink-0 pt-1">{label}</div>
      <div className="min-w-0 flex-1 pt-1">{children}</div>
    </div>
  )
}
