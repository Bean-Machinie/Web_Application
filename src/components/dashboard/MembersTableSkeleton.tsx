import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Built from the same table, header and cell markup as MembersTable, with
// blocks the size of the avatar, name, badge, date and menu button, so each
// row is exactly as tall as a real one. Keep the two in step.
export function MembersTableSkeleton({ withActions }: { withActions: boolean }) {
  return (
    <div
      className="overflow-hidden rounded-lg border"
      aria-busy="true"
      aria-label="Loading members"
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            {withActions && <TableHead className="w-12" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {[0, 1, 2].map((row) => (
            <TableRow key={row}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Skeleton className="size-8 rounded-full" />
                  <Skeleton className="h-4 w-28" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-14 rounded-4xl" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              {withActions && (
                <TableCell className="text-right">
                  <Skeleton className="ml-auto size-8" />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
