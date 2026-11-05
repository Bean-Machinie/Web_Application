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
  // The entry that was open before this one, reached by a link: one step back along the way here.
  back?: { title: string; go: () => void }
}

// One entry of the rules reference: title, summary, facts, its blocks, and where to read on.
export function RuleTermView({ termId, onSelect, onBack, back }: Props) {
  const entry = ruleEntry(termId)
  if (!entry) return null
  // The badge names what kind of thing it is (Skill, Condition…), or else the group it is in.
  const kind = entry.tag ?? categoryTitle(entry.category)

  return (
    <article className="@container flex max-w-prose flex-col gap-6 text-sm font-normal">
      {(onBack || back) && (
        <div className="-mb-2 -ml-2 flex items-center gap-1 self-start">
          {back && (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={back.go}>
              <ChevronLeft /> Back to {back.title}
            </Button>
          )}
          {onBack && (
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={onBack}>
              {!back && <ChevronLeft />} All rules
            </Button>
          )}
        </div>
      )}
      <header className="grid gap-3 pb-2">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-semibold tracking-tight">{entry.title}</h1>
          <Badge variant="secondary" className="text-muted-foreground rounded-md">
            {kind}
          </Badge>
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
