import type { ReactNode } from "react"

type Props = {
  children: ReactNode
  // A muted phrase on the same baseline, after the label. It stays on one line.
  hint?: string
  // At the right end of the row, such as a switch. It must fit in 28px.
  action?: ReactNode
}

// The label over a section of the Workshop: 16px, with an optional muted phrase after it, in a row of one height so
// what is under it lines up across the columns.
export function SectionLabel({ children, hint, action }: Props) {
  return (
    <div className="mb-4 flex h-7 items-center justify-between gap-3">
      <div className="flex min-w-0 items-baseline gap-2">
        <h2 className="shrink-0 text-base font-semibold">{children}</h2>
        {hint && <p className="text-muted-foreground truncate text-sm">{hint}</p>}
      </div>
      {action}
    </div>
  )
}
