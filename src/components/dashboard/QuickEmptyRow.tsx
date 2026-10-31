// The place of a row that is not filled in yet: the same height, with faint bars where its name
// and value will be.
export function QuickEmptyRow() {
  return (
    <div aria-hidden className="flex h-[52px] flex-col justify-center gap-1.5">
      <span className="bg-muted h-2 w-24 rounded-[4px]" />
      <span className="bg-muted/60 h-2 w-16 rounded-[4px]" />
    </div>
  )
}
