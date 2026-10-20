import { LibraryBrowse } from "./LibraryBrowse"
import { HelpHint } from "./HelpHint"
import { LibraryShell } from "./LibraryShell"

type Props = { open: boolean; onClose: () => void }

// Your library, opened over the page you were on, in the same window as
// "Add from your library".
export function LibraryDialog({ open, onClose }: Props) {
  return (
    <LibraryShell
      open={open}
      onClose={onClose}
      title="Your library"
      description="Your reusable entries. Open one, or make a new entry."
      help={
        <HelpHint
          title="Your library"
          summary="Entries you keep once and reuse in any campaign."
          lines={[
            { label: "Open an entry", how: "Click a card" },
            { label: "Make an entry", how: "New, beside the search" },
            { label: "Rename or delete", how: "The menu on a card" },
            { label: "Find one", how: "Search, or pick a kind" },
            { label: "Use it in a campaign", how: "Add from library, in its World" },
          ]}
          note="Adding copies it to the campaign, so changing the copy does not change your library."
        />
      }
    >
      {(compact) => <LibraryBrowse compact={compact} />}
    </LibraryShell>
  )
}
