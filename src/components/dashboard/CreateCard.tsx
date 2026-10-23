import type { ReactNode } from "react"

// A titled card of rows, the frame of Home's Recent card.
export function CreateCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-card flex flex-col rounded-lg border">
      <h2 className="px-4 pt-4 pb-2 text-xl font-semibold tracking-tight">{title}</h2>
      <div className="flex flex-1 flex-col px-2 pb-2">{children}</div>
    </section>
  )
}
