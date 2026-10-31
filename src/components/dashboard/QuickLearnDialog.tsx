import { AnimatePresence, motion } from "motion/react"
import { Dialog as DialogPrimitive } from "radix-ui"
import { Button } from "@/components/ui/button"
import { KIND_TEXT, optionsOf } from "@/lib/quick-options"
import type { QuickKind } from "@/lib/quick-options"
import type { SheetActions } from "./character-actions"
import { QUICK_DETAILS } from "./quick-details"
import { SLOT_ICONS } from "./quick-icons"

type Props = {
  // The slot and option shown; none keeps the dialog closed.
  shown: { slotId: string; kind: QuickKind; id: string } | null
  actions: SheetActions
  onClose: () => void
  onSelect: (id: string) => void
}

// The details of one option in a centred dialog that its card morphs into (it shares the
// card's layoutId), closing on Esc or a click outside, where the card returns.
export function QuickLearnDialog({ shown, actions, onClose, onSelect }: Props) {
  const option = shown ? optionsOf(shown.kind).find((candidate) => candidate.id === shown.id) : undefined
  const Details = shown && QUICK_DETAILS[shown.kind]
  const Icon = shown && SLOT_ICONS[shown.kind]

  return (
    <DialogPrimitive.Root open={!!option} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal forceMount>
        <AnimatePresence>
          {option && shown && Details && Icon && (
            <DialogPrimitive.Overlay key="overlay" asChild forceMount>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/50" />
            </DialogPrimitive.Overlay>
          )}
          {option && shown && Details && Icon && (
            <div key="frame" className="pointer-events-none fixed inset-0 z-50 grid place-items-center p-4">
              <DialogPrimitive.Content asChild forceMount aria-describedby={undefined}>
                <motion.div
                  layoutId={`card:${shown.slotId}:${shown.id}`}
                  className="bg-background pointer-events-auto flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border shadow-xl outline-none"
                >
                  <div className="bg-muted/70 text-muted-foreground flex h-40 shrink-0 items-center justify-center">
                    {option.image ? <img src={option.image} alt="" className="size-full object-cover" /> : <Icon aria-hidden className="size-14" strokeWidth={1.25} />}
                  </div>
                  <div className="flex flex-col gap-1 px-4 pt-4 pb-3">
                    <DialogPrimitive.Description className="text-muted-foreground text-sm">{KIND_TEXT[shown.kind].noun}</DialogPrimitive.Description>
                    <DialogPrimitive.Title className="font-serif text-3xl tracking-tight">{option.name}</DialogPrimitive.Title>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto">
                    <Details id={option.id} actions={actions} />
                    <p className="text-muted-foreground px-4 pb-4 text-xs">{option.source}</p>
                  </div>
                  <div className="flex justify-end gap-2 border-t p-3">
                    <Button variant="ghost" onClick={onClose}>Close</Button>
                    <Button onClick={() => onSelect(option.id)}>Select {option.name}</Button>
                  </div>
                </motion.div>
              </DialogPrimitive.Content>
            </div>
          )}
        </AnimatePresence>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
