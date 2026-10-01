import { Skeleton } from "@/components/ui/skeleton"
import { gridClass } from "./WorldEntryGrid"

export function WorldGridSkeleton() {
  return (
    <div className={gridClass}>
      {[0, 1, 2, 3].map((card) => (
        <div key={card} className="overflow-hidden rounded-xl border">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="flex flex-col gap-2 p-3.5">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-5 w-16 rounded-4xl" />
          </div>
        </div>
      ))}
    </div>
  )
}
