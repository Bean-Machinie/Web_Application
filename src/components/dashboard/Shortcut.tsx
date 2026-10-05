import type { ReactNode } from "react"

// A shortcut shown after a name in a tooltip.
export function Shortcut({ children }: { children: ReactNode }) {
  return <span className="ml-1.5 opacity-60">{children}</span>
}
