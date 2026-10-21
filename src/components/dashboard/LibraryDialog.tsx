import { useCallback, useRef } from "react"
import { MODIFIER_KEY } from "@/lib/selection-hint"
import { LibraryBrowse } from "./LibraryBrowse"
import { HelpHint } from "./HelpHint"
import { LibraryShell } from "./LibraryShell"

type Props = { open: boolean; onClose: () => void }

// Your library, opened over the page you were on, in the same window as
// "Add from your library".
export function LibraryDialog({ open, onClose }: Props) {
  // True while entries are picked: the first Escape lets go of them, the next one
  // closes the window.
  const holding = useRef(false)
  const hold = useCallback((active: boolean) => {
    holding.current = active
  }, [])

  return (
    <LibraryShell
      open={open}
      onClose={onClose}
      title="Your library"
      description="Your reusable entries. Open one, or make a new entry."
      onEscapeKeyDown={(event) => holding.current && event.preventDefault()}
      help={
        <HelpHint
          title="Your library"
          summary="Entries you keep once and reuse in any campaign."
          lines={[
            { label: "Open an entry", how: "Click a card" },
            { label: "Make an entry", how: "New, beside the search" },
            { label: "Pick several", keys: [MODIFIER_KEY, "Click"] },
            { label: "Pick a range", keys: ["Shift", "Click"] },
            { label: "Pick with a box", how: "Drag across the cards" },
            { label: "Change the order", how: "Hold a card, then drag it" },
            { label: "Rename or delete", how: "The menu on a card" },
            { label: "Find one", how: "Search, or pick a kind" },
            { label: "Use it in a campaign", how: "Add from library, in its World" },
          ]}
          note="Adding copies it to the campaign, so changing the copy does not change your library."
        />
      }
    >
      {(compact) => <LibraryBrowse compact={compact} onHold={hold} />}
    </LibraryShell>
  )
}
