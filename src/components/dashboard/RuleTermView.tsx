import { ChevronLeft } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { categoryTitle, ruleEntry } from "@/lib/rules-terms"
import { RuleBlockView } from "./RuleBlockView"
import { RuleLinks } from "./RuleLinks"
import { RuleText } from "./RuleText"

type Props = {
  termId: string
  onSelect: (termId: string) => void
  // Set when the list is not beside the term: a way back to it.
  onBack?: () => void
}

// One entry of the rules reference: title, summary, facts, its blocks, and where to read on.
export function RuleTermView({ termId, onSelect, onBack }: Props) {
  const entry = ruleEntry(termId)
  if (!entry) return null

  return (
    <article className="@container flex max-w-prose flex-col gap-6 text-sm font-normal">
      {onBack && (
        <Button variant="ghost" size="sm" className="text-muted-foreground -mb-2 -ml-2 self-start" onClick={onBack}>
          <ChevronLeft /> All rules
        </Button>
      )}
      <header className="grid gap-3 pb-2">
        <div className="grid gap-1.5">
          <p className="text-muted-foreground text-xs">{categoryTitle(entry.category)}</p>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight">{entry.title}</h1>
            {entry.tag && (
              <Badge variant="secondary" className="text-muted-foreground">
                {entry.tag}
              </Badge>
            )}
          </div>
        </div>
        <p className="text-base leading-relaxed">
          <RuleText text={entry.summary} selfId={entry.id} onSelect={onSelect} dice={false} />
        </p>
        {entry.facts.length > 0 && (
          <p className="text-muted-foreground">
            {entry.facts.map((fact, index) => (
              <span key={fact.label}>
                {index > 0 && " · "}
                {fact.label}:{" "}
                {fact.ref ? <RuleLinks ids={[fact.ref]} onSelect={onSelect} /> : fact.value}
              </span>
            ))}
          </p>
        )}
      </header>
      {entry.blocks.map((block, index) => (
        <RuleBlockView key={index} block={block} selfId={entry.id} onSelect={onSelect} />
      ))}
      {entry.seeAlso.length > 0 && (
        <p className="text-muted-foreground">
          See also: <RuleLinks ids={entry.seeAlso} onSelect={onSelect} />
        </p>
      )}
    </article>
  )
}
