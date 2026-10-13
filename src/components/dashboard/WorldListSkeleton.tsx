import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cellClass, headClass, headRowClass } from "./members-table-styles"
import { useWorldScope } from "./useWorldScope"

// Same table, header and cell markup as WorldEntryList, so rows match in
// height. Keep the two in step.
export function WorldListSkeleton({ canManage }: { canManage: boolean }) {
  const { hasVisibility } = useWorldScope()
  const withVisibility = canManage && hasVisibility

  return (
    <Table>
      <TableHeader>
        <TableRow className={headRowClass}>
          {canManage && <TableHead className={`${headClass} w-11 pr-0 md:w-14`} />}
          <TableHead className={`${headClass} w-[50%]`}>Name</TableHead>
          <TableHead className={headClass}>Type</TableHead>
          {withVisibility && <TableHead className={headClass}>Visibility</TableHead>}
          {canManage && <TableHead className={`${headClass} w-16`} />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[0, 1, 2].map((row) => (
          <TableRow key={row}>
            {canManage && (
              <TableCell className={`${cellClass} pr-0`}>
                <Skeleton className="size-4 rounded-[4px]" />
              </TableCell>
            )}
            <TableCell className={cellClass}>
              <div className="flex items-center gap-3">
                <Skeleton className="size-16 rounded-lg md:size-20" />
                <Skeleton className="h-4 w-36" />
              </div>
            </TableCell>
            <TableCell className={cellClass}>
              <Skeleton className="h-5 w-12 rounded-full" />
            </TableCell>
            {withVisibility && (
              <TableCell className={cellClass}>
                <Skeleton className="h-5 w-24" />
              </TableCell>
            )}
            {canManage && (
              <TableCell className={`${cellClass} text-right`}>
                <Skeleton className="ml-auto size-8" />
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
