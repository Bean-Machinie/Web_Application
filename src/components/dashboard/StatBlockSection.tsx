import type { ReactNode } from "react"
import type { StatAction } from "@/lib/stat-block-types"
import { StatBlockItem } from "./StatBlockItem"

type Props = { title: string; items: StatAction[]; onRule: (termId: string) => void; intro?: ReactNode }

// Traits, Actions and the rest: a small heading over its items; nothing at all without items.
export function StatBlockSection({ title, items, onRule, intro }: Props) {
  if (items.length === 0) return null
  return (
    <section className="grid gap-2">
      <h2 className="text-muted-foreground border-b pb-1 text-xs font-semibold">{title}</h2>
      {intro && <p className="leading-relaxed">{intro}</p>}
      {items.map((item) => (
        <StatBlockItem key={item.name} item={item} onRule={onRule} />
      ))}
    </section>
  )
}
