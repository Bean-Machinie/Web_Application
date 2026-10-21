import { useState } from "react"
import { Library } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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
  const [added, setAdded] = useState<{ count: number; note: string } | null>(null)
  useNoticeTimeout(added !== null, () => setAdded(null))

  if (!addFromLibrary) return null

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
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
        </TooltipTrigger>
        <TooltipContent>Copy entries from your library into this campaign</TooltipContent>
      </Tooltip>
      <AddFromLibraryDialog
        open={open}
        add={addFromLibrary}
        onClose={() => setOpen(false)}
        onAdded={(count, note) => {
          setAdded({ count, note })
          void onAdded()
        }}
      />
      {added !== null && (
        <BottomNotice
          text={`Added ${added.count === 1 ? "1 entry" : `${added.count} entries`} from your library. ${
            added.count === 1 ? "It starts" : "They start"
          } hidden.${added.note ? ` ${added.note}` : ""}`}
        />
      )}
    </>
  )
}
