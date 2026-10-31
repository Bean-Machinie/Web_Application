import type { ReactNode } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  disabled: boolean
  // What the panel is called in its handle's label and tooltip: "tool panel".
  name: string
  children: ReactNode
}

// The docked panel beside the rail. It lies over the centre and slides in and out like the
// sidebar does, so the centre is never resized and what is in it stays where it is; only putting
// it away by hand closes it. It is placed against the rail, over the whole height of the builder,
// status bar too, so that its handle reaches the bottom as the rail does; it is cut off at the
// rail as it slides away.
export function BuilderLeftPanel({ open, onOpenChange, disabled, name, children }: Props) {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-16 z-20 w-[14.75rem] overflow-hidden">
      <Collapsible
        open={open}
        onOpenChange={onOpenChange}
        className={`pointer-events-auto absolute inset-y-0 left-0 flex transition-transform duration-200 ease-linear motion-reduce:transition-none data-[state=closed]:-translate-x-56 ${disabled ? "pointer-events-none" : ""}`}
      >
        {/* The foot is the profile, which lies over it from the rail (see BuilderAccount). */}
        <div inert={!open} className="bg-background w-56 border-r pb-[68px]">
          {children}
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <CollapsibleTrigger
              aria-label={open ? `Put the ${name} away` : `Show the ${name}`}
              className="text-muted-foreground bg-background hover:bg-muted flex w-3 items-center border-r outline-none"
            >
              {open ? <ChevronLeft className="size-3" /> : <ChevronRight className="size-3" />}
            </CollapsibleTrigger>
          </TooltipTrigger>
          <TooltipContent side="right">
            {open ? `Hide ${name}` : `Show ${name}`}
          </TooltipContent>
        </Tooltip>
      </Collapsible>
    </div>
  )
}
