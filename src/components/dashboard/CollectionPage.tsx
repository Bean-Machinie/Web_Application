import { useRef } from "react"
import type { CSSProperties, ReactNode } from "react"
import { useScrollbarWidth } from "@/hooks/use-scrollbar-width"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { QUIET_SCROLL } from "@/lib/quiet-scroll"
import { cn } from "@/lib/utils"
import { PanelHeader } from "./PanelHeader"
import { PlainBackground } from "./PlainBackground"

type Props = {
  // On the left of the toolbar: usually tabs.
  tabs: ReactNode
  // On the right: search, filter, view switch and the buttons that add.
  actions: ReactNode
  // The content fills the window below the toolbar, edge to edge, and does not scroll: a graph or
  // a map. Otherwise the content scrolls under the toolbar.
  bleed?: boolean
  // A table: it starts right under the toolbar, so that its header is fixed there.
  flush?: boolean
  // The panel at the right, laid out as the library's; absent while nothing is open in it.
  detail?: ReactNode
  children: ReactNode
}

// The scroller keeps a gutter the width of the scrollbar at both sides, scrollbar or not, so the
// list never shifts and the gaps match left and right.
// The page of a collection (the world, and later sessions, characters, the party), laid out as the
// library is: the whole window below the header, a toolbar over the content, which scrolls on its
// own, and at the right a panel of tabs once something is open. It cancels the dashboard's padding
// to span the width, and gives it back inside.
export function CollectionPage({ tabs, actions, bleed, flush, detail, children }: Props) {
  const root = useRef<HTMLDivElement>(null)
  useScrollbarWidth(root)
  return (
    <div
      ref={root}
      // What a sticky header inside the content sticks under: the top of the content.
      style={{ "--collection-top": "0px" } as CSSProperties}
      className="-m-4 h-[calc(100svh-var(--header-height))] min-w-0 flex-none md:-m-6"
    >
      {bleed && <PlainBackground />}
      <ResizablePanelGroup orientation="horizontal">
        <ResizablePanel id="collection-main" minSize="30%">
          <div className="@container flex h-full min-w-0 flex-col">
            {/* One row whatever the width: where the panel is too narrow for the tabs, they are a
                drop-down in the same place. */}
            {/* The content's side margins, scrollbar gutter included, so the buttons line up with it. */}
            <PanelHeader className={cn("h-12 items-end justify-between gap-4 px-4 md:px-6", !bleed && "px-[calc(1rem+var(--scrollbar-width,0px))] md:px-[calc(1.5rem+var(--scrollbar-width,0px))]")}>
              {/* The tabs and the actions give way together: the menu from 14rem, the search from its own width. */}
              <div className="flex min-w-36 flex-[1_1_14rem] items-end self-stretch">{tabs}</div>
              <div className="flex min-w-0 shrink items-center gap-2 self-center">{actions}</div>
            </PanelHeader>
            <div className={cn("isolate flex min-h-0 min-w-0 flex-1 flex-col", bleed ? "overflow-hidden" : `${QUIET_SCROLL} overflow-y-auto px-4 pb-4 [scrollbar-gutter:stable_both-edges] md:px-6 md:pb-6`)}>
              <div className={cn("flex min-w-0 flex-col", bleed ? "min-h-0 flex-1" : "min-h-full gap-3", !bleed && !flush && "pt-4 md:pt-6")}>{children}</div>
            </div>
          </div>
        </ResizablePanel>
        {detail && (
          <>
            <ResizableHandle />
            <ResizablePanel id="collection-detail" defaultSize="40%" minSize="25%" maxSize="65%">
              {detail}
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  )
}
