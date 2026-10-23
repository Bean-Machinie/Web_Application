import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { readList } from "@/lib/character-values"
import type { ListItem } from "@/lib/character-values"
import { InlineText } from "./InlineText"

// Short items, each read as text and typed over when clicked, with a way to add more.
export function CharacterListValue({ value, onChange }: { value: unknown; onChange: (items: ListItem[]) => void }) {
  const items = readList(value)
  const [adding, setAdding] = useState(false)

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      {items.map((item) => (
        <div key={item.id} className="group/item flex items-center gap-1">
          <div className="min-w-0 flex-1">
            <InlineText
              value={item.text}
              placeholder="Item"
              maxLength={120}
              onSave={(text) => onChange(items.map((other) => (other.id === item.id ? { ...other, text } : other)))}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 opacity-0 transition-opacity group-focus-within/item:opacity-100 group-hover/item:opacity-100"
            aria-label={`Remove ${item.text}`}
            onClick={() => onChange(items.filter((other) => other.id !== item.id))}
          >
            <X />
          </Button>
        </div>
      ))}
      {adding ? (
        <InlineText
          value=""
          placeholder="Item"
          autoEdit
          maxLength={120}
          onSave={(text) => onChange([...items, { id: crypto.randomUUID(), text }])}
          onDone={() => setAdding(false)}
        />
      ) : (
        <Button variant="ghost" size="sm" className="text-muted-foreground -ml-2 w-fit" onClick={() => setAdding(true)}>
          <Plus />
          Add
        </Button>
      )}
    </div>
  )
}
