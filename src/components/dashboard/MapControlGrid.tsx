// The navigator's control rows on columns of fixed widths, so that the sliders are
// equal and the numbers and buttons line up. The one divider is in the sixth column
// and runs down both rows.
export function MapControlGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[minmax(2rem,1fr)_2.875rem_repeat(3,1.5rem)_1px_1.5rem] items-center gap-x-1 gap-y-2">
      <span className="bg-border col-start-6 row-span-2 row-start-1 mx-auto h-full w-px" />
      {children}
    </div>
  )
}
