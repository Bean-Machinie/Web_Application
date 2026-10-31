import type { ReactNode } from "react"

type Props = {
  // The base score: typed, picked or bought.
  base: ReactNode
  // The background's increase to this ability, and where it comes from; none when it has none.
  bonus: number
  source?: string
}

// "Base 15 + 2 Acolyte": the base score with the increase to it, always named by its source.
export function QuickScoreLine({ base, bonus, source }: Props) {
  return (
    <span className="inline-flex flex-wrap items-baseline justify-center gap-x-1">
      Base
      {base}
      {bonus > 0 && source && <span>+ {bonus} {source}</span>}
    </span>
  )
}
