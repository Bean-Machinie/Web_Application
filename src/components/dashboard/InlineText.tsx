import { useState } from "react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

type Props = {
  value: string
  // What shows, dimmed, when there is no value.
  placeholder: string
  // Called with the new text when it is saved; an empty text only counts where allowed.
  onSave: (text: string) => void
  allowEmpty?: boolean
  maxLength?: number
  // Opens ready to type over the value.
  autoEdit?: boolean
  // Called when editing ends, saved or not.
  onDone?: () => void
  inputMode?: "numeric"
  // How the value reads when not being edited; the text itself by default.
  display?: ReactNode
  className?: string
}

// Reads as plain text and becomes a box when clicked, like renaming a file: Enter or
// leaving the box saves, Escape cancels. The text and the box take the same room, so
// swapping them moves nothing.
export function InlineText({ value, placeholder, onSave, allowEmpty, maxLength = 80, autoEdit, onDone, inputMode, display, className }: Props) {
  const [draft, setDraft] = useState<string | null>(autoEdit ? value : null)
  const shared = cn("-mx-1.5 block min-h-7 w-[calc(100%+0.75rem)] min-w-0 rounded-md border px-1.5 py-0.5 text-left text-sm outline-none", className)

  function finish(save: boolean) {
    const next = draft?.trim() ?? ""
    setDraft(null)
    if (save && next !== value && (next !== "" || allowEmpty)) onSave(next)
    onDone?.()
  }

  if (draft !== null) {
    return (
      <input
        aria-label={placeholder}
        autoFocus
        maxLength={maxLength}
        inputMode={inputMode}
        value={draft}
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => finish(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter") finish(true)
          if (event.key === "Escape") finish(false)
        }}
        className={cn(shared, "border-foreground/40 bg-background ring-foreground/10 ring-2")}
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => setDraft(value)}
      className={cn(shared, "hover:bg-muted focus-visible:border-foreground/40 focus-visible:ring-foreground/10 cursor-text border-transparent focus-visible:ring-2")}
    >
      {value === "" ? <span className="text-muted-foreground">{placeholder}</span> : (display ?? value)}
    </button>
  )
}
