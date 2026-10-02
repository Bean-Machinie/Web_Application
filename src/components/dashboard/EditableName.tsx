import { useState } from "react"

type Props = {
  name: string
  // Null for people who may not rename.
  onSave: ((name: string) => Promise<void>) | null
}

const HEADING = "text-2xl font-semibold tracking-tight break-words"

// The page title. For a GM it is click-to-rename in place, like renaming a
// file: Enter or leaving the box saves, Escape cancels.
export function EditableName({ name, onSave }: Props) {
  const [draft, setDraft] = useState<string | null>(null)

  if (!onSave) return <h2 className={`${HEADING} min-w-0 flex-1`}>{name}</h2>

  function finish(save: boolean) {
    const next = draft?.trim() ?? ""
    setDraft(null)
    if (save && next !== "" && next !== name) onSave!(next)
  }

  if (draft !== null) {
    return (
      <input
        aria-label="Name"
        autoFocus
        maxLength={80}
        value={draft}
        onFocus={(event) => event.currentTarget.select()}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={() => finish(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter") finish(true)
          if (event.key === "Escape") finish(false)
        }}
        className={`${HEADING} border-ring ring-ring/30 bg-background -mx-2 min-w-0 flex-1 rounded-lg border px-2 py-0.5 ring-3 outline-none`}
      />
    )
  }

  return (
    <h2 className="min-w-0 flex-1">
      <button
        type="button"
        title="Click to rename"
        onClick={() => setDraft(name)}
        className={`${HEADING} hover:bg-muted focus-visible:ring-ring -mx-2 block w-[calc(100%+1rem)] cursor-text rounded-lg px-2 py-0.5 text-left outline-none focus-visible:ring-2`}
      >
        {name}
      </button>
    </h2>
  )
}
