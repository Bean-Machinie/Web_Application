import { Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { readResource, toWhole } from "@/lib/character-values"
import type { ResourceValue } from "@/lib/character-values"
import { InlineText } from "./InlineText"

type Props = { value: unknown; label: string; onChange: (value: ResourceValue) => void }

// Current and maximum, each typed over when clicked (a muted dash while empty), with
// steppers to spend and gain.
export function CharacterResourceValue({ value, label, onChange }: Props) {
  const stored = readResource(value)
  const resource = stored ?? { current: 0, max: 0 }
  const change = (next: Partial<ResourceValue>) => onChange({ ...resource, ...next })
  const step = (by: number) => change({ current: Math.max(0, resource.current + by) })
  const number = (key: keyof ResourceValue) => ({
    value: stored ? resource[key].toString() : "",
    placeholder: "—",
    label: `${label}, ${key === "current" ? "current" : "maximum"}`,
    inputMode: "numeric" as const,
    maxLength: 6,
    className: "text-center tabular-nums",
    onSave: (text: string) => change({ [key]: Math.max(0, toWhole(text) ?? 0) }),
  })

  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="icon" className="size-6" aria-label="Spend one" onClick={() => step(-1)}>
        <Minus />
      </Button>
      <div className="w-9">
        <InlineText {...number("current")} />
      </div>
      <span className="text-muted-foreground">/</span>
      <div className="w-9">
        <InlineText {...number("max")} />
      </div>
      <Button variant="ghost" size="icon" className="size-6" aria-label="Gain one" onClick={() => step(1)}>
        <Plus />
      </Button>
    </div>
  )
}
