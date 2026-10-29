import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Props = {
  // The saved name; empty while there is none.
  value: string
  // Shown, muted, while there is none.
  placeholder: string
  label: string
  maxLength?: number
  // Saves the name; false if it could not be.
  onSave: (name: string) => Promise<boolean>
}

// The title of a builder's top bar, which a click turns into a field in the same place. The
// text and the field are stacked in one grid cell with the same padding and type, and the text
// is kept (unseen) while editing to give the cell its width, so nothing around it moves when
// editing starts or ends and the cell grows with what is typed. Enter or leaving the field
// saves; Escape puts the name back. An empty name is not saved.
export function EditableTitle({ value, placeholder, label, maxLength = 80, onSave }: Props) {
  const [draft, setDraft] = useState<string | null>(null)
  // What was just saved, shown until the page has the new name.
  const [saved, setSaved] = useState<string | null>(null)
  const input = useRef<HTMLInputElement>(null)
  // Escape removes the field, which may or may not blur it first; either way it saves nothing.
  const cancelled = useRef(false)
  const shown = saved ?? value
  const editing = draft !== null

  useEffect(() => setSaved(null), [value])
  useEffect(() => {
    if (editing) input.current?.select()
  }, [editing])

  async function commit() {
    if (cancelled.current) return
    const name = (draft ?? "").trim()
    setDraft(null)
    if (name === "" || name === shown) return
    setSaved(name)
    if (!(await onSave(name))) {
      setSaved(null)
      toast.error("Couldn't rename. The old name is back.")
    }
  }

  const text = (editing ? draft : shown) || placeholder

  return (
    <h1 className="relative -ml-2 grid max-w-[min(32rem,40vw)] min-w-0 items-center text-base">
      <button
        type="button"
        aria-label={`${label}: ${shown || placeholder}. Click to rename`}
        tabIndex={editing ? -1 : 0}
        onClick={() => {
          cancelled.current = false
          setDraft(shown)
        }}
        className={cn(
          "hover:bg-accent focus-visible:ring-ring col-start-1 row-start-1 min-w-24 cursor-text truncate rounded-md px-2 py-1 text-left font-medium outline-none focus-visible:ring-2",
          shown === "" && "text-muted-foreground",
          editing && "invisible"
        )}
      >
        {text}
      </button>
      {editing && (
        <input
          ref={input}
          value={draft}
          maxLength={maxLength}
          aria-label={label}
          spellCheck={false}
          placeholder={placeholder}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={commit}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur()
            if (event.key === "Escape") {
              cancelled.current = true
              setDraft(null)
            }
          }}
          className="bg-background ring-ring placeholder:text-muted-foreground absolute inset-0 w-full min-w-0 rounded-md px-2 py-1 font-medium ring-2 outline-none"
        />
      )}
    </h1>
  )
}
