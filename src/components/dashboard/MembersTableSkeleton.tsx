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

// Built from the same table, header and cell markup as MembersTable, with
// blocks the size of the avatar, name, badge, date and menu button, so each
// row is exactly as tall as a real one. Keep the two in step.
export function MembersTableSkeleton({ withActions }: { withActions: boolean }) {
  return (
    <Table>
      <TableHeader>
        <TableRow className={headRowClass}>
          <TableHead className={`${headClass} w-[55%]`}>Name</TableHead>
          <TableHead className={headClass}>Role</TableHead>
          <TableHead className={headClass}>Joined</TableHead>
          {withActions && <TableHead className={`${headClass} w-16`} />}
        </TableRow>
      </TableHeader>
      <TableBody>
        {[0, 1, 2].map((row) => (
          <TableRow key={row}>
            <TableCell className={cellClass}>
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
            </TableCell>
            <TableCell className={cellClass}>
              <Skeleton className="h-5 w-14 rounded-4xl" />
            </TableCell>
            <TableCell className={cellClass}>
              <Skeleton className="h-4 w-20" />
            </TableCell>
            {withActions && (
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
