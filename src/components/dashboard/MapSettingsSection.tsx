import { ChevronDown } from "lucide-react"
import { Collapsible, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useMapSectionOpen } from "@/hooks/use-map-section-open"

// The map's settings as a section of the right panel, with a header that opens
// and shuts it. It opens by growing a row of a grid from nothing, which takes
// the same 200 ms as the tool panel and the sidebar.
export function MapSettingsSection({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useMapSectionOpen()

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="group/section grid grid-rows-[auto_0fr] border-b transition-[grid-template-rows] duration-200 ease-linear motion-reduce:transition-none data-[state=open]:grid-rows-[auto_1fr]"
    >
      <CollapsibleTrigger className="hover:bg-muted/50 flex h-9 items-center justify-between px-4 text-sm font-medium outline-none focus-visible:bg-muted">
        Map
        <ChevronDown className="text-muted-foreground size-4 transition-transform duration-200 group-data-[state=open]/section:rotate-180" />
      </CollapsibleTrigger>
      <div inert={!open} className="min-h-0 overflow-hidden">
        <div className="grid gap-4 px-4 pt-1 pb-4">{children}</div>
      </div>
    </Collapsible>
  )
}
