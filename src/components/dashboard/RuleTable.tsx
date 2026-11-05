import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Props = { caption: string; columns: string[]; rows: string[][] }

// A table of the rules, compact, in a bordered box with its name above.
export function RuleTable({ caption, columns, rows }: Props) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium">{caption}</p>
      <div className="overflow-hidden rounded-lg border">
        <Table className="text-sm">
          <TableHeader className="bg-muted/40">
            <TableRow className="hover:bg-transparent">
              {columns.map((column) => (
                <TableHead key={column} className="h-9 px-4">
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                {row.map((cell, at) => (
                  <TableCell key={at} className="px-4 py-2.5 whitespace-normal">
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
