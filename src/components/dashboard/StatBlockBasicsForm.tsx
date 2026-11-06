import { Input } from "@/components/ui/input"
import type { StatBlock } from "@/lib/stat-block-types"
import { StatField } from "./StatField"

type Props = { block: StatBlock; onChange: (block: StatBlock) => void }

const toNumber = (text: string, fallback: number) => (text.trim() !== "" && Number.isFinite(Number(text)) ? Number(text) : fallback)

// Type, alignment and the numbers of the key stats.
export function StatBlockBasicsForm({ block, onChange }: Props) {
  const number = (label: string, value: number, apply: (next: number) => Partial<StatBlock>) => (
    <StatField label={label}>
      <Input type="number" value={value} onChange={(event) => onChange({ ...block, ...apply(toNumber(event.target.value, value)) })} />
    </StatField>
  )
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatField label="Type">
        <Input value={block.type} onChange={(event) => onChange({ ...block, type: event.target.value })} />
      </StatField>
      <StatField label="Alignment" className="sm:col-span-2">
        <Input value={block.alignment} onChange={(event) => onChange({ ...block, alignment: event.target.value })} />
      </StatField>
      <StatField label="CR">
        <Input value={block.cr.value} onChange={(event) => onChange({ ...block, cr: { ...block.cr, value: event.target.value } })} />
      </StatField>
      {number("AC", block.ac, (ac) => ({ ac }))}
      {number("Initiative", block.initiative.modifier, (modifier) => ({ initiative: { ...block.initiative, modifier } }))}
      {number("HP", block.hp.average, (average) => ({ hp: { ...block.hp, average } }))}
      <StatField label="HP formula">
        <Input value={block.hp.formula} onChange={(event) => onChange({ ...block, hp: { ...block.hp, formula: event.target.value } })} />
      </StatField>
      {number("Speed (ft.)", block.speed.walk ?? 0, (walk) => ({ speed: { ...block.speed, walk } }))}
    </div>
  )
}
