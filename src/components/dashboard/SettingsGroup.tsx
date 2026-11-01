import type { ReactNode } from "react"

type Props = { title: string; children: ReactNode }

// A heading over rows that sit straight on the window, set apart by hairlines.
export function SettingsGroup({ title, children }: Props) {
  return (
    <section className="flex flex-col gap-1">
      <h3 className="text-sm font-semibold">{title}</h3>
      <div className="divide-y border-t">{children}</div>
    </section>
  )
}
