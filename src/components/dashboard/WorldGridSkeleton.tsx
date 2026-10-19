import { Skeleton } from "@/components/ui/skeleton"
import { gridClass } from "./WorldEntryGrid"

export function WorldGridSkeleton() {
  return (
    <div className={gridClass}>
      {[0, 1, 2, 3, 4].map((card) => (
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
