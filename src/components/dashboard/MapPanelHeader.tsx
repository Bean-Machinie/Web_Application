import type { ComponentProps, ReactNode } from "react"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// What scrolls in a group of the right panel: under its bar, and the only thing in
// the group that does. The room for the scrollbar is always kept, so that nothing
// shifts when one tab has enough to scroll and the next has not.
export const PANEL_SCROLL =
  "min-h-0 flex-1 overflow-y-auto [scrollbar-color:var(--border)_transparent] [scrollbar-gutter:stable] [scrollbar-width:thin]"

// The bar at the top of a group of the right panel, the same for each: a shade
// apart from the panel, with flat tabs (inside a Tabs) and, if there is any, a
// control at its far end. With "fill", the tabs share the whole width between them.
export function MapPanelHeader({ children, end, fill }: { children: ReactNode; end?: ReactNode; fill?: boolean }) {
  return (
    <div className="bg-muted/50 flex h-8 shrink-0 items-stretch justify-between border-b">
      <TabsList
        className={cn("h-full justify-start gap-0 rounded-none bg-transparent p-0", fill ? "w-full" : "w-auto")}
      >
        {children}
      </TabsList>
      {end}
    </div>
  )
}

// A flat tab: no pill, a bar across its top when it is the one showing, and the
// panel's own shade, so that it joins what is under it.
export function MapPanelTab({ className, ...props }: ComponentProps<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      {...props}
      className={cn(
        "text-muted-foreground h-full flex-none rounded-none border-0 border-r px-3 text-xs shadow-none",
        "data-active:bg-background data-active:text-foreground data-active:shadow-none dark:data-active:border-transparent dark:data-active:border-r-border dark:data-active:bg-background",
        "group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:top-0 group-data-horizontal/tabs:after:bottom-auto",
        "after:bg-primary data-active:after:opacity-100",
        className
      )}
    />
  )
}
