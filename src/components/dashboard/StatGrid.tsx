import type { ReactNode } from "react"
import { QuickValue } from "./QuickValue"

export type StatCell = {
  key: string
  // Short, and never wrapped: "HP", "Initiative".
  label: string
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
}

type Props = { cells: StatCell[]; label: string }

// Numbers in a grid three across: cells on the card's colour with hairlines between them, which
// are the gaps of a grid on the border's colour, so they are exact. A cell is its name small and
// muted over the value large, and under that a sub-value if it has one.
export function StatGrid({ cells, label }: Props) {
  return (
    <ul aria-label={label} className="bg-border grid grid-cols-3 gap-px overflow-hidden rounded-lg border">
      {cells.map((cell) => {
        const body = (
          <>
            <span className="text-muted-foreground text-[11px] leading-none font-medium tracking-wide whitespace-nowrap uppercase">{cell.label}</span>
            <span className="text-[22px] leading-tight font-semibold tabular-nums"><QuickValue value={cell.value} changed={cell.changed} /></span>
            {cell.sub !== undefined && <span className="text-muted-foreground text-xs tabular-nums"><QuickValue value={cell.sub} changed={!!cell.subChanged} /></span>}
          </>
        )
        const look = "flex flex-1 flex-col items-center gap-1 p-3 text-center"
        return (
          <li key={cell.key} className="bg-card flex flex-col">
            {cell.onOpen ? (
              <button type="button" aria-label={cell.openLabel} onClick={cell.onOpen} className={`${look} hover:bg-accent/60 focus-visible:ring-ring cursor-pointer outline-none transition-colors focus-visible:ring-2 focus-visible:ring-inset`}>
                {body}
              </button>
            ) : (
              <div className={look}>{body}</div>
            )}
            <span className="flex justify-center pb-2 empty:hidden">{cell.extra}</span>
          </li>
        )
      })}
    </ul>
  )
}
