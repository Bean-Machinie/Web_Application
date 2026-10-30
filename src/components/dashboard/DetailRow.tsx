import type { ReactNode } from "react"

// A label and its value, in a ruled row.
export function BuilderRow({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[10rem_minmax(0,1fr)] items-start gap-4 border-t py-2.5 text-sm">
      <div className="text-muted-foreground">{label}</div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
