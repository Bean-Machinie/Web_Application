import { PanelLeftOpen } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { LIBRARY_GROUPS } from "@/lib/library-sections"
import { JournalRailButton } from "./JournalRailButton"

type Props = { active: string; onSelect: (sectionId: string) => void; onExpand: () => void }

// The tree when it is narrowed: the top node of each group as an icon with its name in a tooltip,
// the one that widens it on top. A node is lit while it or something inside it is open.
export function LibraryRail({ active, onSelect, onExpand }: Props) {
  return (
    <div className="flex h-full flex-col items-center gap-1 p-2">
      <Tooltip>
        <TooltipTrigger asChild>
          <JournalRailButton aria-label="Show library" onClick={onExpand}>
            <PanelLeftOpen />
          </JournalRailButton>
        </TooltipTrigger>
        <TooltipContent side="right">Show library</TooltipContent>
      </Tooltip>
      <div className="flex min-h-0 flex-1 flex-col items-center gap-1 overflow-y-auto">
        {LIBRARY_GROUPS.map((group) => (
          <div key={group.title} className="flex flex-col items-center gap-1">
            <div className="bg-border my-1 h-px w-6 shrink-0" />
            {group.sections.map(({ id, label, icon: Icon }) => (
              <Tooltip key={id}>
                <TooltipTrigger asChild>
                  <JournalRailButton aria-label={label} active={active === id || active.startsWith(`${id}:`)} onClick={() => onSelect(id)}>
                    <Icon />
                  </JournalRailButton>
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
