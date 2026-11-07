import type { ReactNode } from "react"

// The small muted header of the right column of Home, with a link or button at its right end.
export function HomeSideHeader({ title, children }: { title: string; children: ReactNode }) {
  return (
    <header className="text-muted-foreground flex items-center justify-between gap-3 px-2 text-xs">
      <h2 className="font-medium">{title}</h2>
      {children}
    </header>
  )
}
