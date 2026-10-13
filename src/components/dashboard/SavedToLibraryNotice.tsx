import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

// The same bar the settings show after a save, floating over the foot of the
// page. It is centred on the content, so it keeps clear of the sidebar.
export function SavedToLibraryNotice({ name }: { name: string }) {
  const { state } = useSidebar()

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-none fixed right-0 bottom-0 left-0 z-50 flex justify-center p-4 md:p-6",
        state === "collapsed" ? "md:left-(--sidebar-width-icon)" : "md:left-(--sidebar-width)"
      )}
    >
      <div className="bg-popover animate-in fade-in-0 slide-in-from-bottom-4 pointer-events-auto flex min-h-12 w-full max-w-2xl items-center justify-between gap-3 rounded-xl border py-2 pr-2 pl-4 shadow-lg duration-200 ease-out">
        <span className="min-w-0 text-sm font-medium text-emerald-600 dark:text-emerald-500">
          {`Saved ${name} to your library.`}
        </span>
        <Button asChild variant="ghost" size="sm" className="shrink-0">
          <Link to="/app/library">View in library</Link>
        </Button>
      </div>
    </div>
  )
}
