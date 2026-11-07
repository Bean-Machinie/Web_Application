import { useState } from "react"
import { ChevronDown, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { useStoredValue } from "@/hooks/use-stored-value"
import type { LibraryGroup } from "@/lib/library-sections"
import { libraryRows } from "@/lib/library-tree"
import { readIds, writeIds } from "@/lib/stored-ids"
import { LibraryNodeRow } from "./LibraryNodeRow"

type Props = {
  // The groups of nodes to choose from: the library's or the rules'.
  groups: LibraryGroup[]
  active: string
  // Null where a count is not known yet.
  count: (sectionId: string) => number | null
  onSelect: (sectionId: string) => void
}

// Whatever is open is shown unfolded, so the node can always be seen in the list.
const ancestorsOf = (id: string) => id.split(":").slice(0, -1).map((_, at, parts) => parts.slice(0, at + 1).join(":"))

// What the library or the rules show, chosen from one drop-down in the toolbar in place of a tree at the side:
// each a group of nodes that fold. Choosing a node closes it.
export function LibraryNodeMenu({ groups, active, count, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [unfolded, setUnfolded] = useStoredValue("library-menu-open", readIds, writeIds)
  const everything = libraryRows(groups.flatMap((group) => group.sections), new Set())
  const current = everything.find((row) => row.section.id === active)
  // The icon of the top node it is under, as nested nodes have none of their own.
  const top = [...everything.slice(0, everything.indexOf(current!) + 1)].reverse().find((row) => row.depth === 0)
  const Icon = top?.section.icon
  const shown = new Set([...unfolded, ...ancestorsOf(active)])

  function toggle(id: string) {
    const next = new Set(unfolded)
    if (!next.delete(id)) next.add(id)
    setUnfolded(next)
  }

  return (
    <div className="my-auto w-56 max-w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" aria-label="Section" className="w-full justify-between font-normal">
            <span className="flex min-w-0 items-center gap-2">
              {Icon && <Icon className="text-muted-foreground" />}
              <span className="truncate">{current?.section.label}</span>
            </span>
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs tabular-nums">
              {count(active)}
              <ChevronDown className="size-4" />
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={4} className="max-h-[min(32rem,var(--radix-popover-content-available-height))] w-72 gap-0 overflow-y-auto p-1">
          {groups.map((group, index) => {
            const folded = group.sections.filter((section) => section.children && !shown.has(section.id)).map((section) => section.id)
            const rows = libraryRows(group.sections, new Set(folded))
            return (
              <section key={group.title}>
                {index > 0 && <Separator className="bg-border-strong my-1" />}
                <h2 className="text-muted-foreground flex items-center gap-1.5 px-2 pt-1.5 pb-1 text-xs font-medium">
                  {group.title}
                  {group.hint && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button type="button" aria-label={`About ${group.title}`} className="outline-none">
                          <Info className="size-3.5" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>{group.hint}</TooltipContent>
                    </Tooltip>
                  )}
                </h2>
                {rows.map(({ section, depth }) => (
                  <LibraryNodeRow
                    key={section.id}
                    section={section}
                    depth={depth}
                    active={active === section.id}
                    open={shown.has(section.id)}
                    hasChildren={!!section.children}
                    count={count(section.id)}
                    onSelect={() => {
                      onSelect(section.id)
                      setOpen(false)
                    }}
                    onToggle={() => toggle(section.id)}
                  />
                ))}
              </section>
            )
          })}
        </PopoverContent>
      </Popover>
    </div>
  )
}
