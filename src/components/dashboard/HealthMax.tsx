import { useRef, useState } from "react"

type Props = {
  max: number | undefined
  // Null for players: plain text.
  onSave: ((max: number) => void) | null
}

const line = "text-muted-foreground mt-0.5 flex h-5 items-center gap-1 text-sm leading-5"
// Only the number is interactive; "of" stays plain text.
const target =
  "hover:bg-muted hover:text-foreground focus-visible:ring-ring pointer-events-auto relative z-10 cursor-text rounded-sm px-1 transition-colors outline-none focus-visible:ring-2"

// "of 7" under the number. Clicking the number edits it: the field is laid
// over the number so the line never moves. Enter saves, Escape cancels, and
// clicking away saves.
export function HealthMax({ max, onSave }: Props) {
  const [editing, setEditing] = useState(false)
  const cancelled = useRef(false)

  if (!onSave) return <span className={line}>{max === undefined ? "" : `of ${max}`}</span>

  const commit = (text: string) => {
    const number = Number(text)
    if (text.trim() !== "" && Number.isFinite(number) && number >= 0) onSave(Math.trunc(number))
    setEditing(false)
  }

  const field = (
    <input
      autoFocus
      type="number"
      inputMode="numeric"
      min={0}
      aria-label="Maximum health"
      defaultValue={max}
      className="border-foreground/15 text-foreground selection:bg-foreground/15 selection:text-foreground focus-visible:border-foreground/50 absolute inset-y-[-2px] -right-1 left-0 rounded-sm border bg-transparent px-0 text-center text-sm font-medium tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      onFocus={(event) => event.target.select()}
      onBlur={(event) => !cancelled.current && commit(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") commit(event.currentTarget.value)
        if (event.key === "Escape") {
          cancelled.current = true
          setEditing(false)
        }
      }}
    />
  )

  const open = () => {
    cancelled.current = false
    setEditing(true)
  }
  const text = max === undefined ? "Set max" : String(max)
  const label = (
    <>
      <span className={`${editing ? "invisible" : ""} tabular-nums`}>{text}</span>
      {editing && field}
    </>
  )

  // One element in both states, so nothing remounts or shifts on click.
  const number = (
    <span
      role="button"
      tabIndex={0}
      aria-label="Edit maximum health"
      className={`${target} ${editing ? "hover:bg-transparent" : ""}`}
      onClick={() => !editing && open()}
      onKeyDown={(event) => {
        if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault()
          open()
        }
      }}
    >
      {label}
    </span>
  )

  return (
    <span className={line}>
      {max !== undefined && "of"}
      {number}
    </span>
  )
}
