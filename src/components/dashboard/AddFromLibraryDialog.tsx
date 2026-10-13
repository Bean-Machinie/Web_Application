import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { usePhoneScreen } from "@/hooks/use-phone-screen"
import { AddFromLibraryBody } from "./AddFromLibraryBody"

type Props = {
  open: boolean
  add: (entryId: string) => Promise<void>
  onAdded: (count: number) => void
  onClose: () => void
}

const DESCRIPTION =
  "Adds copies to this campaign. They start hidden, and changing a copy does not change your library."

// A dialog on a larger screen; on a phone a sheet over the whole screen, with
// the entries to scroll with a thumb.
export function AddFromLibraryDialog({ open, onClose, ...body }: Props) {
  const phone = usePhoneScreen()

  if (phone) {
    return (
      <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="gap-0 rounded-none p-0 data-[side=bottom]:h-dvh data-[side=bottom]:border-t-0"
        >
          <SheetHeader className="flex h-12 shrink-0 flex-row items-center justify-between border-b py-0 pr-1 pl-4">
            <SheetTitle className="text-sm font-semibold">Add from your library</SheetTitle>
            <SheetClose asChild>
              <Button variant="ghost" aria-label="Close" className="size-11">
                <X />
              </Button>
            </SheetClose>
          </SheetHeader>
          <SheetDescription className="sr-only">{DESCRIPTION}</SheetDescription>
          <div className="flex min-h-0 flex-1 flex-col p-3">
            {open && <AddFromLibraryBody {...body} onClose={onClose} compact />}
          </div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle>Add from your library</DialogTitle>
          <DialogDescription>{DESCRIPTION}</DialogDescription>
        </DialogHeader>
        {open && <AddFromLibraryBody {...body} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}
