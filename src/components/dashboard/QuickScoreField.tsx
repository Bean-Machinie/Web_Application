import { useRef, useState } from "react"

type Props = {
  label: string
  value: number | null
  // Said on hover: what can be typed.
  hint: string
  // A number the sheet does not take leaves the field as it was.
  onCommit: (score: number) => void
}

// The base score inside a line of text. It is always the same input, a fixed width, so editing
// moves nothing: only a dotted underline says it can be edited, and a solid one while it is.
// Enter or clicking away saves, Escape puts back what was there.
export function QuickScoreField({ label, value, hint, onCommit }: Props) {
  const [draft, setDraft] = useState<string | null>(null)
  const cancelled = useRef(false)

  const finish = (save: boolean) => {
    const number = Number(draft)
    if (save && !cancelled.current && draft?.trim() && Number.isInteger(number) && number !== value) onCommit(number)
    cancelled.current = false
    setDraft(null)
  }

  return (
    <input
      inputMode="numeric"
      aria-label={`${label} base score`}
      title={hint}
      value={draft ?? (value === null ? "" : String(value))}
      placeholder="–"
      maxLength={2}
      className="text-foreground selection:bg-foreground/15 decoration-muted-foreground/60 hover:decoration-foreground focus-visible:decoration-foreground w-[2ch] cursor-text rounded-none border-0 bg-transparent p-0 text-center font-medium tabular-nums underline decoration-dotted decoration-1 underline-offset-4 outline-none focus-visible:decoration-solid"
      onFocus={(event) => event.target.select()}
      onChange={(event) => setDraft(event.target.value.replace(/\D/g, ""))}
      onBlur={() => finish(true)}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur()
        if (event.key === "Escape") {
          cancelled.current = true
          event.currentTarget.blur()
        }
      }}
    />
  )
}
