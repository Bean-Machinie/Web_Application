import { ResizableHandle } from "@/components/ui/resizable"

// The gutter between two groups of a panel, the same for each: a slim band, and a
// knob that stands a little above it, the way a tab does, to show it can be pulled.
// The handle itself reaches up to the top of the knob, so that is all of it to grab;
// the band is drawn in its lower part. The knob is a span because the base handle
// turns any div inside it a quarter round. It brightens when reached or pulled.
export function MapPanelHandle() {
  return (
    <ResizableHandle className="group/handle -mt-1 bg-transparent aria-[orientation=horizontal]:h-3.5">
      <span className="bg-muted/30 pointer-events-none absolute inset-x-0 bottom-0 h-2.5 border-y" />
      <span className="bg-muted-foreground pointer-events-none absolute top-[2.5px] left-1/2 z-10 h-1 w-16 -translate-x-1/2 rounded-full brightness-75 transition-[filter] duration-150 ease-out group-data-[separator=active]/handle:brightness-125 group-data-[separator=hover]/handle:brightness-125" />
    </ResizableHandle>
  )
}
