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

// Same table, header and cell markup as WorldEntryList, so rows match in
// height. Keep the two in step.
export function WorldListSkeleton({ canManage }: { canManage: boolean }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className={headRowClass}>
          <TableHead className={`${headClass} w-[50%]`}>Name</TableHead>
          <TableHead className={headClass}>Type</TableHead>
          {canManage && <TableHead className={headClass}>Visibility</TableHead>}
          {canManage && <TableHead className={`${headClass} w-16`} />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[0, 1, 2].map((row) => (
          <TableRow key={row}>
            <TableCell className={cellClass}>
              <div className="flex items-center gap-3">
                <Skeleton className="size-14 rounded-lg" />
                <Skeleton className="h-4 w-36" />
              </div>
            </TableCell>
            <TableCell className={cellClass}>
              <Skeleton className="h-5 w-12 rounded-full" />
            </TableCell>
            {canManage && (
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
