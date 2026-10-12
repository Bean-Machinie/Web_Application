import type { ReactNode } from "react"

// A bordered group of settings rows with hairline dividers.
export function SettingsCard({ children }: { children: ReactNode }) {
  return <div className="bg-card divide-y overflow-hidden rounded-xl border">{children}</div>
}
