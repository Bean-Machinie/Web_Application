import { DndContext, PointerSensor, closestCenter, useSensor, useSensors } from "@dnd-kit/core"
import type { DragEndEvent } from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import type { WorldEntry } from "@/lib/world-entries"
import { DetailTab } from "./DetailTab"
import { describeLibraryTab } from "./libraryDetailTab"
import type { LibraryTabsState } from "./useLibraryTabs"

const keyOf = (tab: { kind: string; id: string }) => `${tab.kind}:${tab.id}`

type Props = { tabs: LibraryTabsState; entries: WorldEntry[] | null; basePath: string }

// The tabs of the detail panel, which can be put in another order by dragging along the bar. A
// small movement is still a click, which shows the tab.
export function DetailTabList({ tabs, entries, basePath }: Props) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))
  const ids = tabs.tabs.map(keyOf)

  function onDragEnd({ active, over }: DragEndEvent) {
    if (over) tabs.move(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={horizontalListSortingStrategy}>
        <div role="tablist" className="flex min-w-0 flex-1 items-stretch overflow-x-auto [scrollbar-width:none]">
          {tabs.tabs.map((tab, index) => {
            const label = describeLibraryTab(tab, entries, basePath)
            return (
              <DetailTab key={keyOf(tab)} id={keyOf(tab)} icon={label.icon} title={label.title} active={index === tabs.active} onShow={() => tabs.show(index)} onClose={() => tabs.close(index)} />
            )
          })}
        </div>
      </SortableContext>
    </DndContext>
  )
}
