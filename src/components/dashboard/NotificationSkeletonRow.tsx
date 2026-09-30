import { Skeleton } from "@/components/ui/skeleton"

// Same padding, avatar and two text lines as NotificationRow.
export function NotificationSkeletonRow() {
  return (
    <li className="py-4 pr-4 pl-6" aria-hidden="true">
      <div className="flex items-start gap-3">
        <Skeleton className="size-10 shrink-0 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-5 w-4/5" />
          <Skeleton className="mt-0 h-4 w-20" />
        </div>
      </div>
    </li>
  )
}
