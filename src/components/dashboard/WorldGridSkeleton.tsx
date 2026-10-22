import { Skeleton } from "@/components/ui/skeleton"
import { gridStyle } from "./world-grid-style"

export function WorldGridSkeleton() {
  return (
    <div style={gridStyle("medium")} className="grid gap-4">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((card) => (
        <div key={card} className="overflow-hidden rounded-lg border">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="flex flex-col gap-1 p-2.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
