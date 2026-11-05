import type { RuleEffect } from "@/lib/srd-rules-types"
import { cn } from "@/lib/utils"
import { RuleText } from "./RuleText"

type Props = { items: RuleEffect[]; selfId: string; onSelect: (termId: string) => void; depth?: number }

// Beside the label from 560px of room; below that the label sits above its text.
const ROW = "grid gap-1 border-b py-3 pr-4 last:border-b-0 @min-[560px]:grid-cols-[170px_1fr] @min-[560px]:gap-6"

// What an entry does, set out like a table of the rules: the name on the left, what it does on the
// right, and what sits inside one indented under it.
export function RuleEffects({ items, selfId, onSelect, depth = 0 }: Props) {
  return (
    <>
      {items.map((item) => (
        <div key={item.label} className="contents">
          <div className={cn(ROW, depth > 0 && "bg-muted/30")} style={{ paddingLeft: 16 + depth * 20 }}>
            <p className="font-medium">{item.label}</p>
            <div className="grid gap-2 leading-relaxed">
              <p>
                <RuleText text={item.text} selfId={selfId} onSelect={onSelect} />
              </p>
              {item.bullets && (
                <ul className="marker:text-muted-foreground list-disc space-y-1 pl-4">
                  {item.bullets.map((bullet) => (
                    <li key={bullet}>
                      <RuleText text={bullet} selfId={selfId} onSelect={onSelect} />
                    </li>
                  ))}
                </ul>
              )}
              {item.example && (
                <p className="text-muted-foreground border-l-2 pl-3">
                  <span className="mr-1.5 text-xs font-medium">Example</span>
                  <RuleText text={item.example} selfId={selfId} onSelect={onSelect} />
                </p>
              )}
            </div>
          </div>
          {item.items && <RuleEffects items={item.items} selfId={selfId} onSelect={onSelect} depth={depth + 1} />}
        </div>
      ))}
    </>
  )
}
