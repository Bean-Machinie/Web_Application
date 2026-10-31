import type { ReactNode } from "react"
import { BuilderLeftPanel } from "./BuilderLeftPanel"
import { BuilderAccount } from "./BuilderAccount"

type Props = {
  topBar: ReactNode
  // What the builder has to say under the top bar.
  banners?: ReactNode
  // The buttons of the icon rail down the left; the profile is added at its foot.
  rail: ReactNode
  railLabel: string
  // Saves what is waiting before the profile's menu leaves the builder; false if that failed.
  beforeLeave: () => Promise<boolean>
  // The rail and the left panel cannot be used, as while publishing.
  disabled: boolean
  leftPanel: ReactNode
  leftPanelName: string
  leftPanelOpen: boolean
  onLeftPanelOpenChange: (open: boolean) => void
  centre: ReactNode
  statusBar: ReactNode
  rightPanel: ReactNode
  // Dialogs, which lie over the builder.
  children?: ReactNode
}

// The full-screen layout of a builder, like a design tool's: a bar across the top; the icon rail
// down the left with the profile at its foot; a panel beside it that can be put away; the centre,
// with a thin bar under it; and a panel on the right. It holds no content of its own: each part
// is passed in, and the left panel's open state is the builder's, which needs it for its view.
export function BuilderShell(props: Props) {
  const { disabled, leftPanelOpen } = props
  return (
    <div className="bg-background fixed inset-0 z-50 flex flex-col">
      {props.topBar}
      {props.banners}
      <div className="relative flex min-h-0 flex-1">
        <nav
          aria-label={props.railLabel}
          className={`bg-sidebar text-sidebar-foreground border-sidebar-border relative z-30 flex w-16 shrink-0 flex-col items-center gap-1 border-r px-2 py-2 ${disabled ? "pointer-events-none opacity-60" : ""}`}
        >
          {props.rail}
          <BuilderAccount expanded={leftPanelOpen} beforeLeave={props.beforeLeave} />
        </nav>
        <BuilderLeftPanel open={leftPanelOpen} onOpenChange={props.onLeftPanelOpenChange} disabled={disabled} name={props.leftPanelName}>
          {props.leftPanel}
        </BuilderLeftPanel>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="relative flex min-h-0 flex-1 overflow-hidden">{props.centre}</div>
          {props.statusBar}
        </div>
        {props.rightPanel}
      </div>
      {props.children}
    </div>
  )
}
