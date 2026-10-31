import type { ReactNode } from "react"
import type { Explanation } from "@/lib/character-glossary"
import { cn } from "@/lib/utils"
import { GlossaryLabel } from "./GlossaryLabel"
import { QuickValue } from "./QuickValue"

export type StatCell = {
  key: string
  // Short, and never wrapped: "HP", "Initiative".
  label: string
  // With it the label explains itself on hover, as the sheet's do.
  explanation?: Explanation | null
  value: string
  changed: boolean
  // A small line under the value: the score under an ability's modifier.
  sub?: string
  subChanged?: boolean
  // With it the cell is a button.
  onOpen?: () => void
  openLabel?: string
  // Under the cell's content, like the Edited marker.
  extra?: ReactNode
  // The large grid only, under the value in this order: a muted caption ("Modifier"), a muted line of
  // working ("Score 17 = 15 + 2 Soldier"), what sets the value, and what sits in the cell's top
  // right corner. The Edited marker goes at the end of the caption.
  detail?: ReactNode
  note?: string
  control?: ReactNode
  corner?: ReactNode
  // For a link to scroll to the cell, and a ring for a moment.
  id?: string
  highlighted?: boolean
}

type Props = {
  cells: StatCell[]
  label: string
  // Larger cells with room for working and a control: 24px of padding, a 40px value, all of one height.
  large?: boolean
}

// Numbers in a grid three across: cells on the card's colour with hairlines between them, which
// are the gaps of a grid on the border's colour, so they are exact. A cell is its name small and
// muted over the value large, and under that a sub-value if it has one.
export function StatGrid({ cells, label, large }: Props) {
  return (
    <ul aria-label={label} className={cn("bg-border grid grid-cols-3 gap-px overflow-hidden rounded-lg border", large && "auto-rows-fr")}>
      {cells.map((cell) => {
        const body = (
          <>
            <GlossaryLabel explanation={cell.explanation ?? null}>
              <span className={cn("text-muted-foreground leading-none font-medium tracking-wide whitespace-nowrap uppercase", large ? "text-xs" : "text-[11px]")}>{cell.label}</span>
            </GlossaryLabel>
            <span className={cn("leading-tight font-semibold tabular-nums", large ? "text-[40px] leading-none" : "text-[22px]")}><QuickValue value={cell.value} changed={cell.changed} /></span>
            {cell.sub !== undefined && <span className="text-muted-foreground text-xs tabular-nums"><QuickValue value={cell.sub} changed={!!cell.subChanged} /></span>}
            {large && (
              <span className="text-muted-foreground -mt-1 flex min-h-5 items-center gap-2 text-[13px]">
                {cell.detail}
                {cell.extra}
              </span>
            )}
            {large && <span className="text-muted-foreground min-h-5 text-[13px] tabular-nums">{cell.note}</span>}
            {large && cell.control}
          </>
        )
        const look = cn("flex flex-1 flex-col items-center text-center", large ? "gap-2 p-6" : "gap-1 p-3")
        return (
          <li key={cell.key} id={cell.id} className={cn("bg-card relative flex flex-col transition-shadow duration-500", cell.highlighted ? "ring-ring ring-2 ring-inset" : "ring-2 ring-transparent ring-inset")}>
            {large && cell.corner && <span className="absolute top-2 right-2">{cell.corner}</span>}
            {cell.onOpen ? (
              <button type="button" aria-label={cell.openLabel} onClick={cell.onOpen} className={`${look} hover:bg-accent/60 focus-visible:ring-ring cursor-pointer outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset`}>
                {body}
              </button>
            ) : (
              <div className={look}>{body}</div>
            )}
            {!large && <span className="flex justify-center pb-2 empty:hidden">{cell.extra}</span>}
          </li>
        )
      })}
    </ul>
  )
}
