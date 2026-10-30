import type { PickOption } from "@/lib/pick-options"
import { PickOptionRow } from "./PickOptionRow"

type Props = {
  options: PickOption[]
  value: string[]
  count: number
  label: string
  onChange: (next: string[]) => void
  // The selection as it would be with the option under the pointer, or null.
  onPreview: (next: string[] | null) => void
}

// The options of one pick with a counter ("2 of 2"). With room for one, a pick swaps the
// choice; with room for several, a full set holds until one is let go.
export function PickList({ options, value, count, label, onChange, onPreview }: Props) {
  const single = count === 1
  const groups = [...new Set(options.map((option) => option.group ?? ""))]
  const toggled = (id: string) => (value.includes(id) ? value.filter((other) => other !== id) : single ? [id] : value.length < count ? [...value, id] : value)

  return (
    <div role={single ? "radiogroup" : "group"} aria-label={label} className="flex flex-col gap-4">
      <p className="text-muted-foreground text-xs" aria-live="polite">{value.length} of {count}</p>
      {groups.map((group) => (
        <div key={group} className="flex flex-col gap-1.5">
          {group && <h3 className="text-muted-foreground text-xs font-medium">{group}</h3>}
          {options
            .filter((option) => (option.group ?? "") === group)
            .map((option) => (
              <PickOptionRow
                key={option.id}
                option={option}
                selected={value.includes(option.id)}
                single={single}
                onToggle={() => onChange(toggled(option.id))}
                onPreview={(on) => onPreview(on && !value.includes(option.id) ? toggled(option.id) : null)}
              />
            ))}
        </div>
      ))}
    </div>
  )
}
