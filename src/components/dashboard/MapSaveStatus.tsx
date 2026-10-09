import { AlertCircle, Check, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useSaveStatus } from "@/hooks/use-save-status"
import type { SaveStore } from "@/lib/scene-save-store"

// The draft's state, quietly: "Saved", or "Unsaved changes" with a dot while they
// wait to be sent. "Saving…" shows only while somebody waits on a save (leaving,
// publishing), so ordinary saves, which come and go on their own, show nothing at
// all. The exact time of the last one is on hover.
export function MapSaveStatus({ store }: { store: SaveStore }) {
  const { state, flushing, savedAt, unpublished } = useSaveStatus(store)

  let content: React.ReactNode
  if (flushing) {
    content = (
      <>
        <Loader2 className="size-3.5 animate-spin" />
        Saving…
      </>
    )
  } else if (state === "error" || state === "conflict") {
    content = (
      <>
        <AlertCircle className="size-3.5" />
        Couldn't save the draft
      </>
    )
  } else if (state === "saved") {
    content = (
      <>
        <Check className="size-3.5" />
        Saved
      </>
    )
  } else {
    content = (
      <>
        <span aria-hidden className="size-1.5 rounded-full bg-amber-500" />
        Unsaved changes
      </>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span role="status" className="text-muted-foreground flex items-center gap-1.5 text-xs">
          {content}
        </span>
      </TooltipTrigger>
      <TooltipContent align="end">
        {savedAt ? `Last saved at ${new Date(savedAt).toLocaleTimeString()}.` : "Nothing changed since you opened it."}{" "}
        {unpublished ? "Not published yet." : "Published to players."}
      </TooltipContent>
    </Tooltip>
  )
}
