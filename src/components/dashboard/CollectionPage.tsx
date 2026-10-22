import type { CSSProperties, ReactNode } from "react"
import { useElementSize } from "@/hooks/use-element-size"
import { cn } from "@/lib/utils"

type Props = {
  // On the left of the toolbar: usually tabs.
  tabs: ReactNode
  // On the right: search, filter, view switch and the buttons that add.
  actions: ReactNode
  // The content fills the window below the toolbar, edge to edge, and the page
  // does not scroll: a graph or a map. Otherwise the content flows and the page scrolls.
  bleed?: boolean
  children: ReactNode
}

// The page of a collection (the world, and later sessions, characters, the party):
// the whole width beside the sidebar with the dashboard's side padding, one toolbar
// that stays under the header, and no box round the content. It cancels the
// dashboard's padding to span the width, and gives it back inside.
export function CollectionPage({ tabs, actions, bleed, children }: Props) {
  const { ref, size } = useElementSize<HTMLDivElement>()

  return (
    <div
      // What a sticky header inside the content sticks under: the page header
      // (3rem) and this toolbar.
      style={{ "--collection-top": `calc(3rem + ${size.height}px)` } as CSSProperties}
      className={cn(
        "-m-4 flex flex-col md:-m-6",
        bleed ? "h-[calc(100svh-3rem)] flex-none" : "flex-1"
      )}
    >
      {/* Above the content, whatever that lifts (a hovered card), and solid. */}
      <div ref={ref} className="bg-background sticky top-12 z-30 shrink-0">
        <div className="flex flex-col gap-2 border-b px-4 pt-2 md:h-12 md:flex-row md:items-end md:justify-between md:gap-4 md:px-6 md:pt-0">
          <div className="min-w-0 md:flex-1">{tabs}</div>
          <div className="flex items-center gap-2 pb-2 md:self-center md:pb-0">{actions}</div>
        </div>
      </div>
      <div
        className={cn(
          // Its own stacking context: nothing inside can rise over the toolbar.
          "isolate flex min-h-0 min-w-0 flex-1 flex-col",
          !bleed && "gap-3 px-4 py-4 md:px-6 md:py-6"
        )}
      >
        {children}
      </div>
    </div>
  )
}
