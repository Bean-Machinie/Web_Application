import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { VisibilitySwitch } from "./VisibilitySwitch"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  revealed: boolean
  canManage: boolean
  onRevealedChange: (revealed: boolean) => void
  onDelete: () => void
  // Shown beside the title, such as whether the entry has been saved.
  status?: ReactNode
  // What this kind of entry adds above the visibility, such as a map's
  // description and its image.
  children?: ReactNode
}

// Every section of the panel: a heading, an optional line of explanation, and
// what it controls.
const SECTION = "flex flex-col gap-3 border-b px-5 py-4"

// The details of an entry, in a panel that slides in from the right: what
// belongs to this kind of entry, then who can see it, and, set apart at the
// bottom, deleting it. The header is a single slim row, so the room is for
// the sections.
export function WorldEntryDetails(props: Props) {
  const { open, onOpenChange, name, revealed, canManage, onRevealedChange, onDelete } = props

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full gap-0 p-0 sm:max-w-md">
        <SheetHeader className="flex h-12 flex-row items-center justify-between border-b py-0 pr-14 pl-5">
          <SheetTitle className="text-sm font-semibold">Details</SheetTitle>
          {/* Read out by screen readers; the panel itself shows the title only. */}
          <SheetDescription className="sr-only">Details of {name}</SheetDescription>
          {props.status}
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto [scrollbar-color:var(--border)_transparent] [scrollbar-width:thin]">
          {props.children}
          {canManage && (
            <section className={`${SECTION} border-b-0`}>
              <div>
                <h3 className="text-sm font-medium">Visibility</h3>
                <p className="text-muted-foreground mt-0.5 text-[13px] leading-snug">
                  Hidden entries are only visible to you. Revealed entries are visible to every
                  player.
                </p>
              </div>
              <VisibilitySwitch revealed={revealed} name={name} onChange={onRevealedChange} />
            </section>
          )}
          {canManage && (
            <section className="bg-destructive/5 mt-auto flex flex-col gap-3 border-t px-5 py-4">
              <div>
                <h3 className="text-destructive text-sm font-medium">Danger zone</h3>
                <p className="text-muted-foreground mt-0.5 text-[13px] leading-snug">
                  Permanently remove this entry. This cannot be undone.
                </p>
              </div>
              <Button variant="destructive" className="w-fit" onClick={onDelete}>
                Delete entry
              </Button>
            </section>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
