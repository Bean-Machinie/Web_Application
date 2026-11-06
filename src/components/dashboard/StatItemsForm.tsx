import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { StatAction } from "@/lib/stat-block-types"

type Props = { title: string; items: StatAction[]; onChange: (items: StatAction[]) => void }

// The traits or actions of one section: name, usage and text of each, and a way to add and remove.
export function StatItemsForm({ title, items, onChange }: Props) {
  const change = (index: number, part: Partial<StatAction>) => onChange(items.map((item, at) => (at === index ? { ...item, ...part } : item)))
  return (
    <section className="grid gap-2">
      <h3 className="text-muted-foreground border-b pb-1 text-xs font-semibold">{title}</h3>
      {items.map((item, index) => (
        <div key={index} className="bg-card grid gap-2 rounded-lg border p-2 shadow-xs">
          <div className="flex gap-2">
            <Input aria-label="Name" placeholder="Name" value={item.name} onChange={(event) => change(index, { name: event.target.value })} />
            <Input aria-label="Usage" placeholder="Usage, e.g. 3/Day" className="w-40" value={item.usage ?? ""} onChange={(event) => change(index, { usage: event.target.value || undefined })} />
            <Button variant="ghost" size="icon" aria-label={`Remove ${item.name}`} onClick={() => onChange(items.filter((_, at) => at !== index))}>
              <X />
            </Button>
          </div>
          {item.spellcasting ? (
            <p className="text-muted-foreground text-xs">The spell list is not editable yet.</p>
          ) : (
            <Textarea aria-label="Text" value={item.text} onChange={(event) => change(index, { text: event.target.value })} />
          )}
        </div>
      ))}
      <Button variant="outline" size="sm" className="w-fit" onClick={() => onChange([...items, { name: "", text: "" }])}>
        <Plus /> Add
      </Button>
    </section>
  )
}
