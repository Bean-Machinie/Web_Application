import { Skeleton } from "@/components/ui/skeleton"

type Props = {
  // How many rows each day group has, so the skeleton is the shape of what it stands in for.
  groups: number[]
}

// The recent list's rows without their data: the day labels and 48px rows, so the card
// keeps its height while the rows load.
export function RecentRowsSkeleton({ groups }: Props) {
  return (
    <div aria-busy="true" className="flex flex-col">
      {groups.map((rows, group) => (
        <div key={group} className="flex flex-col">
          <div className="px-2 pt-2 pb-1">
            <Skeleton className="h-3 w-12" />
          </div>
          {Array.from({ length: rows }, (_, row) => (
            <div key={row} className="flex items-center gap-3 px-2 py-2">
              <Skeleton className="size-8 shrink-0 rounded-md" />
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <Skeleton className="h-3.5 w-3/5" />
                <Skeleton className="h-3 w-2/5" />
              </div>
              <Skeleton className="h-3 w-8 shrink-0" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
