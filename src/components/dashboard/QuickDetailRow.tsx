import { QuickValue } from "./QuickValue"

type Props = {
  label: string
  value: string
  changed: boolean
  // Opens the sheet that changes it; none, and the row is only a line of text.
  onOpen: (() => void) | null
}

const ROW = "flex h-9 w-full items-center justify-between gap-3 rounded-[4px] px-2 text-[13px]"

// A line of a property list: the name muted at the left, the value at the right, cut short with
// an ellipsis. With a sheet to change it, the whole row is a button with a hover background.
export function QuickDetailRow({ label, value, changed, onOpen }: Props) {
  const body = (
    <>
      <span className="text-muted-foreground shrink-0">{label}</span>
      <span className="min-w-0 truncate text-right"><QuickValue value={value} changed={changed} className="-mr-1" /></span>
    </>
  )
  if (!onOpen) return <div className={ROW}>{body}</div>
  return (
    <button type="button" onClick={onOpen} className={`${ROW} hover:bg-accent/60 focus-visible:ring-ring cursor-pointer text-left outline-none transition-colors focus-visible:ring-2`}>
      {body}
    </button>
  )
}
