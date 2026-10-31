import type { ReactNode } from "react"

// A scrolling area between two hairlines that run the width of the panel it sits in, as a physical
// edge, with a shadow always falling from the top one.
export function ScrollShadow({ children }: { children: ReactNode }) {
  return (
    <div className="relative -mx-4 min-h-0 flex-1 border-y">
      <div className="flex h-full flex-col gap-4 overflow-y-auto px-4 py-4 [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">{children}</div>
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-black/30 to-transparent" />
    </div>
  )
}
