import type { ReactNode } from "react"

// Settings rows on the surface of the window, set apart by hairline dividers.
export function SettingsCard({ children }: { children: ReactNode }) {
  return <div className="divide-y border-y">{children}</div>
}
