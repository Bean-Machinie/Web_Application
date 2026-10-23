import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { readResource, toWhole } from "@/lib/character-values"
import type { ResourceValue } from "@/lib/character-values"
import { InlineText } from "./InlineText"

type Props = { value: unknown; onChange: (value: ResourceValue) => void }

// Current and maximum, each typed over when clicked, with steppers to spend and gain.
export function CharacterResourceValue({ value, onChange }: Props) {
  const resource = readResource(value) ?? { current: 0, max: 0 }
  const change = (next: Partial<ResourceValue>) => onChange({ ...resource, ...next })
  const step = (by: number) => change({ current: Math.max(0, resource.current + by) })
  const number = (key: keyof ResourceValue) => ({
    value: resource[key].toString(),
    placeholder: "0",
    inputMode: "numeric" as const,
    maxLength: 6,
    className: "w-12 tabular-nums",
    onSave: (text: string) => change({ [key]: Math.max(0, toWhole(text) ?? 0) }),
  })

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="size-6" aria-label="Spend one" onClick={() => step(-1)}>
        <Minus />
      </Button>
      <div className="w-12">
        <InlineText {...number("current")} />
      </div>
      <span className="text-muted-foreground">/</span>
      <div className="w-12">
        <InlineText {...number("max")} />
      </div>
      <Button variant="ghost" size="icon" className="size-6" aria-label="Gain one" onClick={() => step(1)}>
        <Plus />
      </Button>
    </div>
  )
}
