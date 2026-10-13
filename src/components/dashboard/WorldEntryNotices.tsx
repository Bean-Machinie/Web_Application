import { FormAlert } from "@/components/auth/FormAlert"
import { SavedToLibraryNotice } from "./SavedToLibraryNotice"

type Props = {
  problem: string | null
  // The name of an entry just saved to the library.
  savedName: string | null
}

// What the list has to say about what just happened: a problem under the
// toolbar, and a bar over the foot of the page after a save.
export function WorldEntryNotices({ problem, savedName }: Props) {
  return (
    <>
      {problem && (
        <div className="border-t px-6 py-4">
          <FormAlert tone="error">{problem}</FormAlert>
        </div>
      )}
      {savedName && <SavedToLibraryNotice name={savedName} />}
    </>
  )
}
