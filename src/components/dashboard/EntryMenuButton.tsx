import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

// Opens the details panel of the entry: who can see it, and deleting it.
export function EntryMenuButton({ onOpen }: { onOpen: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Details"
      className="-my-1 -mr-2 size-9 [&_svg]:size-5"
      onClick={onOpen}
    >
      <MoreHorizontal />
    </Button>
  )
}
