import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRowReorder } from "@/hooks/use-row-reorder"
import { readStatBlock, toStoredStatBlock } from "@/lib/stat-block"
import type { StatAction } from "@/lib/stat-block"
import type { FieldEditorProps } from "./field-types"
import { StatActionRow } from "./StatActionRow"

// The actions of a stat block: add, edit, reorder and remove. The core stats
// live in the same value and are edited in the tiles beside the image.
export function StatActionsEditor({ value, onChange }: FieldEditorProps) {
  const block = readStatBlock(value)
  const actions = block.actions ?? []
  const save = (next: StatAction[]) => onChange(toStoredStatBlock({ ...block, actions: next }))

  const { rowProps } = useRowReorder({
    ids: actions.map((action) => action.id),
    onReorder: (ids) => save(ids.map((id) => actions.find((action) => action.id === id)!)),
  })

  return (
    <div className="flex flex-col gap-2">
      {actions.map((action, index) => (
        <div
          key={action.id}
          className="bg-card flex items-center gap-2 rounded-lg border p-1.5 pl-2 select-none data-lifted:border-ring data-lifted:shadow-[0_24px_28px_rgb(16_24_40/0.18),0_8px_10px_rgb(16_24_40/0.12)]"
          {...rowProps(action.id, index)}
        >
          <StatActionRow
            action={action}
            onChange={(change) =>
              save(actions.map((item) => (item.id === action.id ? { ...item, ...change } : item)))
            }
            onRemove={() => save(actions.filter((item) => item.id !== action.id))}
          />
        </div>
      ))}
      <Button
        variant="outline"
        size="sm"
        className="w-fit"
        onClick={() => save([...actions, { id: crypto.randomUUID(), name: "", text: "" }])}
      >
        <Plus />
        Add action
      </Button>
    </div>
  )
}
