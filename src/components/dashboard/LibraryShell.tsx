import { HoverIcon } from "@/components/icons/HoverIcon"
import { XIcon } from "@/components/icons/XIcon"
import type { ReactNode } from "react"
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

type Props = {
  open: boolean
  onClose: () => void
  title: string
  // Read by screen readers only.
  description: string
  // The "?" beside the title, saying what can be done in the window.
  help?: ReactNode
  onEscapeKeyDown?: (event: KeyboardEvent) => void
  // Told whether it is a phone, where the window fills the screen.
  children: (compact: boolean) => ReactNode
}

// The frame of every library window: a centred dialog over the page on a
// larger screen; on a phone a sheet over the whole screen, with the entries to
// scroll with a thumb. Its body is only mounted while open, so it starts fresh.
export function LibraryShell({ open, onClose, title, description, help, onEscapeKeyDown, children }: Props) {
  const phone = usePhoneScreen()

  if (phone) {
    return (
      <Sheet open={open} onOpenChange={(next) => !next && onClose()}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          onEscapeKeyDown={onEscapeKeyDown}
          className="gap-0 rounded-none p-0 data-[side=bottom]:h-dvh data-[side=bottom]:border-t-0"
        >
          <SheetHeader className="flex h-12 shrink-0 flex-row items-center justify-between border-b py-0 pr-1 pl-4">
            <div className="flex items-center gap-1">
              <SheetTitle className="text-sm font-semibold">{title}</SheetTitle>
              {help}
            </div>
            <SheetClose asChild>
              <Button variant="ghost" aria-label="Close" className="size-11">
                <HoverIcon icon={XIcon} />
              </Button>
            </SheetClose>
          </SheetHeader>
          <SheetDescription className="sr-only">{description}</SheetDescription>
          <div className="flex min-h-0 flex-1 flex-col p-3">{open && children(true)}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-[min(88rem,calc(100vw-3rem))]" onEscapeKeyDown={onEscapeKeyDown}>
        <DialogHeader>
          <div className="flex items-center gap-1.5">
            <DialogTitle>{title}</DialogTitle>
            {help}
          </div>
          <DialogDescription className="sr-only">{description}</DialogDescription>
        </DialogHeader>
        {open && children(false)}
      </DialogContent>
    </Dialog>
  )
}
