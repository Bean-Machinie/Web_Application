import { useRef, useState } from "react"

type Props = {
  max: number | undefined
  // Null for players: plain text.
  onSave: ((max: number) => void) | null
}

// A line that is 16px tall; the pill and the field are taller and overhang it
// so the tile does not change height while editing.
const lineClass = "text-muted-foreground flex h-4 items-center text-xs leading-4"

function Label({ max }: { max: number | undefined }) {
  if (max === undefined) return <>Set max</>
  return (
    <>
      of <span className="text-foreground/80 ml-1 font-medium tabular-nums">{max}</span>
    </>
  )
}

// "of 7" under the number. A GM clicks it to edit: Enter saves, Escape cancels.
export function HealthMax({ max, onSave }: Props) {
  const [editing, setEditing] = useState(false)
  const cancelled = useRef(false)

  if (!onSave) {
    return <span className={lineClass}>{max === undefined ? "" : <Label max={max} />}</span>
  }

  if (!editing) {
    return (
      <button
        type="button"
        aria-label="Edit maximum health"
        className={`${lineClass} hover:bg-muted hover:text-foreground focus-visible:ring-ring pointer-events-auto relative z-10 -my-0.5 h-5 cursor-text rounded-full px-2.5 transition-colors outline-none focus-visible:ring-2`}
        onClick={() => {
          cancelled.current = false
          setEditing(true)
        }}
      >
        <Label max={max} />
      </button>
    )
  }

  const commit = (text: string) => {
    const number = Number(text)
    if (text.trim() !== "" && Number.isFinite(number) && number >= 0) onSave(Math.trunc(number))
    setEditing(false)
  }

  return (
    <div className={`${lineClass} pointer-events-auto relative z-10 -my-1 h-6 gap-1.5`}>
      of
      <input
        autoFocus
        type="number"
        inputMode="numeric"
        min={0}
        aria-label="Maximum health"
        defaultValue={max}
        className="border-input bg-background text-foreground focus-visible:border-foreground/40 focus-visible:ring-foreground/10 h-6 w-14 rounded-full border text-center text-xs font-medium tabular-nums shadow-xs outline-none focus-visible:ring-2 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
    </div>
  )
}
