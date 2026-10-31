import { cn } from "@/lib/utils"
import { AccountAvatar, AccountDetails } from "./AccountButtonBody"
import { AccountMenu } from "./AccountMenu"

type Props = {
  // Open over the tool panel, widening from the circle to the card as the dashboard's does.
  expanded: boolean
  // Saves what is waiting before leaving the builder; false if that failed.
  beforeLeave: () => Promise<boolean>
}

// Slid by what the panel slides by, 14rem, and in its time. It is done with a transform, as the
// panel's is, which the browser does without waiting for the page; a change of width would stop
// while the builder works out the map's view for the panel being put away.
const SLIDE = "transition-transform duration-200 ease-linear motion-reduce:transition-none"
const AWAY = "-translate-x-56"

// The account at the foot of the builder's tool strip. It is the dashboard's own button, with
// the same classes as the sidebar's menu button (see ui/sidebar.tsx), the same body and the
// same menu: a 52 pixel button, 6 pixels in from the sides. It is the circle of the avatar in the
// strip; when the tool panel is open it reaches over the panel, and goes with the panel's edge as
// it is put away: its ground and its button slide, the avatar slides back by as much so that it
// stays where it is, and the details slide back too, and so stay where they are, being cut off
// by the edge of the button as it goes, as the dashboard's are by the edge of its sidebar; the
// first of them is at the edge when it is done, so they are hidden then, not before.
export function MapAccount({ expanded, beforeLeave }: Props) {
  return (
    <div className="pointer-events-none absolute bottom-0 left-0 h-[68px] w-72 overflow-hidden">
      <div aria-hidden="true" className={cn("bg-sidebar border-sidebar-border absolute inset-0 border-t border-r", SLIDE, !expanded && AWAY)} />
      <div className="absolute top-2 left-1.5 h-[52px] w-69 overflow-hidden rounded-md">
        <AccountMenu side="top" align="start" beforeLeave={beforeLeave}>
          <button
            type="button"
            aria-label="Account"
            className={cn(
              "peer/menu-button group/menu-button ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-open:hover:bg-sidebar-accent data-open:hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground pointer-events-auto relative block size-full cursor-pointer overflow-hidden rounded-md text-left text-sm outline-hidden focus-visible:ring-2 focus-visible:ring-inset",
              SLIDE,
              !expanded && AWAY
            )}
          >
            <span className={cn("absolute inset-y-0 left-2.5 flex items-center", SLIDE, !expanded && "translate-x-56")}>
              <AccountAvatar />
            </span>
            <span className={cn("absolute inset-y-0 right-0 left-[42px] flex items-center gap-2 pr-3 pl-2 transition-[translate,opacity] duration-[200ms,0ms] ease-linear motion-reduce:transition-none", !expanded && "translate-x-56 opacity-0 delay-[0ms,200ms]")}>
              <AccountDetails />
            </span>
          </button>
        </AccountMenu>
      </div>
    </div>
  )
}
