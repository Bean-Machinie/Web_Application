import { useCallback, useRef } from "react"
import { AddFromLibraryBody } from "./AddFromLibraryBody"
import { HelpHint } from "./HelpHint"
import { LibraryShell } from "./LibraryShell"
import { MODIFIER_KEY } from "@/lib/selection-hint"
import type { AddFromLibrary } from "@/lib/world-copy-flow"

type Props = {
  open: boolean
  add: AddFromLibrary
  onAdded: (count: number, note: string) => void
  onClose: () => void
}

const DESCRIPTION =
  "Adds copies to this campaign. They start hidden, and changing a copy does not change your library."

export function AddFromLibraryDialog({ open, onClose, ...body }: Props) {
  // True while entries are picked: the first Escape lets go of them, the next
  // one closes the dialog.
  const holding = useRef(false)
  const hold = useCallback((active: boolean) => {
    holding.current = active
  }, [])

  return (
    <LibraryShell
      open={open}
      onClose={onClose}
      title="Add from your library"
      description={DESCRIPTION}
      onEscapeKeyDown={(event) => holding.current && event.preventDefault()}
      help={
        <HelpHint
          title="Add from your library"
          summary="Pick entries from your library to copy into this campaign."
          lines={[
            { label: "Pick an entry", keys: ["Click"] },
            { label: "Pick a range", keys: ["Shift", "Click"] },
            { label: "Pick everything shown", keys: [MODIFIER_KEY, "A"] },
            { label: "Pick with a box", how: "Drag across the cards" },
            { label: "Let go of the picks", keys: ["Esc"] },
          ]}
          note="Copies start hidden, and changing a copy does not change your library."
        />
      }
    >
      {(compact) => <AddFromLibraryBody {...body} onClose={onClose} onHold={hold} compact={compact} />}
    </LibraryShell>
  )
}
