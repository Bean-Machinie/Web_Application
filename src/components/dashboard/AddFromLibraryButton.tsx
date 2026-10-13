import { useState } from "react"
import { Library } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useNoticeTimeout } from "@/hooks/use-notice-timeout"
import { AddFromLibraryDialog } from "./AddFromLibraryDialog"
import { BottomNotice } from "./BottomNotice"
import { useWorldScope } from "./useWorldScope"

type Props = {
  // Reloads the list once entries were added.
  onAdded: () => Promise<unknown>
}

// The button and everything it opens, so the list only has to place it. It
// stays mounted after the dialog closes to say what was added.
export function AddFromLibraryButton({ onAdded }: Props) {
  const { addFromLibrary } = useWorldScope()
  const [open, setOpen] = useState(false)
  const [added, setAdded] = useState<number | null>(null)
  useNoticeTimeout(added !== null, () => setAdded(null))

  if (!addFromLibrary) return null

  return (
    <>
      <Button
        variant="outline"
        onClick={() => {
          setAdded(null)
          setOpen(true)
        }}
      >
        <Library className="size-4" />
        <span className="max-sm:sr-only">Add from library</span>
      </Button>
      <AddFromLibraryDialog
        open={open}
        add={addFromLibrary}
        onClose={() => setOpen(false)}
        onAdded={(count) => {
          setAdded(count)
          void onAdded()
        }}
      />
      {added !== null && (
        <BottomNotice
          text={`Added ${added === 1 ? "1 entry" : `${added} entries`} from your library. ${
            added === 1 ? "It starts" : "They start"
          } hidden.`}
        />
      )}
    </>
  )
}
