import { ruleEntry } from "@/lib/rules-terms"
import type { RuleBlock } from "@/lib/srd-rules-types"
import { RuleEffects } from "./RuleEffects"
import { RuleExample } from "./RuleExample"
import { RuleLinks } from "./RuleLinks"
import { RuleTable } from "./RuleTable"
import { RuleText } from "./RuleText"

type Props = { block: RuleBlock; selfId: string; onSelect: (termId: string) => void }

const LINK = "text-foreground cursor-pointer hover:underline"

// One block of an entry, drawn by what kind it is.
export function RuleBlockView({ block, selfId, onSelect }: Props) {
  switch (block.type) {
    case "text":
      return (
        <p className="leading-relaxed">
          <RuleText text={block.text} selfId={selfId} onSelect={onSelect} />
        </p>
      )
    case "effects":
      return (
        <div className="overflow-hidden rounded-lg border">
          <RuleEffects items={block.items} selfId={selfId} onSelect={onSelect} />
        </div>
      )
    case "table":
      return <RuleTable caption={block.caption} columns={block.columns} rows={block.rows} />
    case "example":
      return <RuleExample text={block.text} selfId={selfId} onSelect={onSelect} />
    case "bullets":
      return (
        <ul className="list-disc space-y-1 pl-5 leading-relaxed">
          {block.items.map((item) => (
            <li key={item}>
              <RuleText text={item} selfId={selfId} onSelect={onSelect} />
            </li>
          ))}
        </ul>
      )
    case "usedBy":
      return (
        <section className="grid gap-2">
          <h2 className="text-sm font-semibold">Used in</h2>
          <ul className="list-disc space-y-1 pl-5 leading-relaxed">
            {block.items.map((item) => (
              <li key={`${item.ref}${item.text}`}>
                <button type="button" className={LINK} onClick={() => onSelect(item.ref)}>
                  {ruleEntry(item.ref)?.title}
                </button>
                {": "}
                <RuleText text={item.text} selfId={selfId} onSelect={onSelect} />
              </li>
            ))}
          </ul>
        </section>
      )
    case "links":
      return (
        <p className="leading-relaxed">
          {block.label && <span className="text-muted-foreground">{block.label}: </span>}
          <RuleLinks ids={block.items} onSelect={onSelect} />
        </p>
      )
  }
}
