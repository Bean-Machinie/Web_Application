import { cn } from "@/lib/utils"
import { LibraryRail } from "./LibraryRail"
import { LibraryTree } from "./LibraryTree"

type Props = {
  active: string
  count: (sectionId: string) => number | null
  onSelect: (sectionId: string) => void
  open: boolean
  onToggle: (open: boolean) => void
}

// What fills the side panel: the tree when it is wide, the rail when it is narrow, cross-fading as
// the panel moves, as in the journal.
export function LibrarySide({ active, count, onSelect, open, onToggle }: Props) {
  return (
    <div className="relative h-full overflow-hidden">
      <div inert={!open} className={cn("flex h-full min-w-50 flex-col transition-opacity ease-linear", open ? "delay-100 duration-150" : "opacity-0 duration-100")}>
        <LibraryTree active={active} count={count} onSelect={onSelect} onCollapse={() => onToggle(false)} />
      </div>
      <div inert={open} className={cn("absolute inset-y-0 left-0 w-12 transition-opacity ease-linear", open ? "opacity-0 duration-100" : "delay-100 duration-150")}>
        <LibraryRail active={active} onSelect={onSelect} onExpand={() => onToggle(true)} />
      </div>
    </div>
  )
}
