import type { ReactNode } from "react"
import { useSidebar } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

// The bar the settings show over the foot of the page, for notices and for the
// actions on a selection. It is centred on the content, so it keeps clear of
// the sidebar.
export function FloatingBar({ children, alert }: { children: ReactNode; alert?: boolean }) {
  const { state } = useSidebar()

  return (
    <div
      role={alert ? "alert" : "status"}
      className={cn(
        "pointer-events-none fixed right-0 bottom-0 left-0 z-50 flex justify-center p-4 md:p-6",
        state === "collapsed" ? "md:left-(--sidebar-width-icon)" : "md:left-(--sidebar-width)"
      )}
    >
      <div className="bg-popover animate-in fade-in-0 slide-in-from-bottom-4 pointer-events-auto flex min-h-12 w-full max-w-2xl items-center justify-between gap-3 rounded-xl border py-2 pr-2 pl-4 shadow-lg duration-200 ease-out">
        {children}
      </div>
    </div>
  )
}
