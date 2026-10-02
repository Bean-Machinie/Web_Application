import { useState } from "react"

type Props = {
  name: string
  // Null for people who may not rename.
  onSave: ((name: string) => Promise<void>) | null
}

const HEADING = "text-2xl font-semibold tracking-tight break-words"
// Shared by the title and its edit box, so swapping them moves nothing.
const BOX = `${HEADING} -mx-2 block w-[calc(100%+1rem)] rounded-md border px-2 py-0.5 leading-8 outline-none`

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
      <h2 className="min-w-0 flex-1">
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
          className={`${BOX} border-foreground/40 bg-background ring-foreground/10 ring-2`}
        />
      </h2>
    )
  }

  return (
    <h2 className="min-w-0 flex-1">
      <button
        type="button"
        title="Click to rename"
        onClick={() => setDraft(name)}
        className={`${BOX} hover:bg-muted focus-visible:border-foreground/40 focus-visible:ring-foreground/10 cursor-text border-transparent text-left focus-visible:ring-2`}
      >
        {name}
      </button>
    </h2>
  )
}
