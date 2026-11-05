import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

type Props = { caption: string; columns: string[]; rows: string[][] }

// A table of the rules, compact, with its name above.
export function RuleTable({ caption, columns, rows }: Props) {
  return (
    <Table className="text-sm">
      <TableCaption className="mt-0 mb-2 caption-top text-left font-medium">{caption}</TableCaption>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column} className="h-8 px-2">
              {column}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row, index) => (
          <TableRow key={index}>
            {row.map((cell, at) => (
              <TableCell key={at} className="px-2 py-1.5 whitespace-normal">
                {cell}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
