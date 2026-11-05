import type { RuleEffect } from "@/lib/srd-rules-types"
import { RuleText } from "./RuleText"

type Props = { items: RuleEffect[]; selfId: string; onSelect: (termId: string) => void }

// The SRD's own style: a bold name, then what it does. What sits inside one is indented.
export function RuleEffects({ items, selfId, onSelect }: Props) {
  return (
    <div className="grid gap-3">
      {items.map((item) => (
        <div key={item.label} className="grid gap-2">
          <p className="leading-relaxed">
            <span className="font-semibold">{item.label}.</span> <RuleText text={item.text} selfId={selfId} onSelect={onSelect} />
          </p>
          {item.bullets && (
            <ul className="list-disc space-y-1 pl-5 leading-relaxed">
              {item.bullets.map((bullet) => (
                <li key={bullet}>
                  <RuleText text={bullet} selfId={selfId} onSelect={onSelect} />
                </li>
              ))}
            </ul>
          )}
          {item.items && (
            <div className="border-l pl-4">
              <RuleEffects items={item.items} selfId={selfId} onSelect={onSelect} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
