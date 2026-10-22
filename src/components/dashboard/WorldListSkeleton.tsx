import { Skeleton } from "@/components/ui/skeleton"
import { TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table"
import { worldCellClass as cellClass, worldHeadClass as headClass } from "./members-table-styles"
import { useWorldScope } from "./useWorldScope"

// The list's table without its data: same header and 56px rows, so nothing jumps
// when the entries arrive.
export function WorldListSkeleton({ canManage }: { canManage: boolean }) {
  const { hasVisibility } = useWorldScope()
  const withVisibility = canManage && hasVisibility

  return (
    <table className="w-full table-fixed text-sm">
      <thead className="shadow-[inset_0_-1px_0_var(--border)]">
        <TableRow className="border-b-0 hover:bg-transparent">
          <TableHead className={headClass}>Name</TableHead>
          <TableHead className={`${headClass} w-36 max-md:hidden`}>Kind</TableHead>
          {withVisibility && <TableHead className={`${headClass} w-40`}>Visibility</TableHead>}
          <TableHead className={`${headClass} w-32 max-md:hidden`}>Connections</TableHead>
          <TableHead className={`${headClass} w-44 max-md:hidden`}>Last updated</TableHead>
          {canManage && <TableHead className={`${headClass} w-16`} />}
        </TableRow>
      </thead>
      <TableBody>
        {[0, 1, 2, 3].map((row) => (
          <TableRow key={row} className="h-14">
            <TableCell className={`${cellClass} py-2`}>
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-md" />
                <Skeleton className="h-4 w-36" />
              </div>
            </TableCell>
            <TableCell className={`${cellClass} py-2 max-md:hidden`}>
              <Skeleton className="h-5 w-20 rounded-full" />
            </TableCell>
            {withVisibility && (
              <TableCell className={`${cellClass} py-2`}>
                <Skeleton className="h-5 w-24" />
              </TableCell>
            )}
            <TableCell className={`${cellClass} py-2 max-md:hidden`}>
              <Skeleton className="h-4 w-6" />
            </TableCell>
            <TableCell className={`${cellClass} py-2 max-md:hidden`}>
              <Skeleton className="h-4 w-20" />
            </TableCell>
            {canManage && <TableCell className={`${cellClass} py-2`} />}
          </TableRow>
        ))}
      </TableBody>
    </table>
  )
}
