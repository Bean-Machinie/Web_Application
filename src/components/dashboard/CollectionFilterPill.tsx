import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

type Props = {
  text: string
  onClear: () => void
  // Sits higher, above a bar that is already at the foot of the page.
  raised: boolean
}

// A pill floating over the foot of the page while a filter is on: what is shown, and a
// way to clear it. It is out of the layout, so nothing moves when it comes or goes.
// Styled like the settings' "saved" bar, and centred on the content like it.
export function CollectionFilterPill({ text, onClear, raised }: Props) {
  const { state } = useSidebar()

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-none fixed right-0 left-0 z-40 flex justify-center px-4 transition-[bottom] duration-200 md:px-6",
        raised ? "bottom-24" : "bottom-4 md:bottom-6",
        state === "collapsed" ? "md:left-(--sidebar-width-icon)" : "md:left-(--sidebar-width)"
      )}
    >
      <div className="bg-popover animate-in fade-in-0 slide-in-from-bottom-4 pointer-events-auto flex items-center gap-2 rounded-md border py-1.5 pr-1.5 pl-4 text-sm shadow-lg duration-200 ease-out">
        <span className="font-medium">{text}</span>
        <span aria-hidden className="text-muted-foreground">
          ·
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-muted-foreground hover:text-foreground hover:bg-muted focus-visible:ring-ring rounded-sm px-2.5 py-1 font-medium outline-none focus-visible:ring-2"
        >
          Clear
        </button>
      </div>
    </div>
  )
}
