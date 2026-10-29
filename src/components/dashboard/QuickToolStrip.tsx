import type { ReactNode } from "react"
import { Check } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { QUICK_KINDS, KIND_TEXT } from "@/lib/quick-options"
import type { Slot } from "@/lib/quick-slots"
import { SLOT_ICONS } from "./quick-icons"

type Props = {
  open: Slot | null
  // The review, which shows when no slot is open.
  ready: boolean
  // At the foot.
  account: ReactNode
  onShow: (slot: string | null) => void
}

const BUTTON =
  "ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-active:bg-sidebar-accent data-active:text-sidebar-accent-foreground relative flex size-12 shrink-0 cursor-pointer items-center justify-center rounded-md outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-[18px] [&_svg]:shrink-0"

// The narrow strip down the left, as the map builder's: one button for each of the three
// choices, which opens its options, and the review. The same width, colour and buttons.
export function QuickToolStrip({ open, ready, account, onShow }: Props) {
  const items = [
    ...QUICK_KINDS.map((kind) => ({ id: kind, label: KIND_TEXT[kind].noun, icon: SLOT_ICONS[kind], active: open?.kind === kind, onClick: () => onShow(kind), disabled: false })),
    { id: "review", label: "Review", icon: Check, active: open === null, onClick: () => onShow(null), disabled: !ready },
  ]

  return (
    <nav aria-label="Choices" className="bg-sidebar text-sidebar-foreground border-sidebar-border relative z-30 flex w-16 shrink-0 flex-col items-center gap-1 border-r px-2 py-2">
      {items.map(({ id, label, icon: Icon, active, onClick, disabled }) => (
        <Tooltip key={id}>
          <TooltipTrigger asChild>
            <button type="button" data-active={active} aria-label={label} aria-pressed={active} disabled={disabled} onClick={onClick} className={BUTTON}>
              <Icon />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      ))}
      {account}
    </nav>
  )
}
