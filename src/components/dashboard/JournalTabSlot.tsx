import { useEffect, useState } from "react"

// The room a tab being carried will take in a strip: it opens between the tabs, so
// they are seen to make way on either side of where it would land.
export function JournalTabSlot({ width }: { width: number }) {
  const [open, setOpen] = useState(false)

  // After the first paint, so the opening is seen.
  useEffect(() => {
    const frame = requestAnimationFrame(() => setOpen(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      aria-hidden
      style={{ width: open ? width : 0 }}
      className="bg-primary/10 border-primary/40 shrink-0 border-x transition-[width] duration-150 ease-out motion-reduce:transition-none"
    />
  )
}
