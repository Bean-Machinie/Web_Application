import { ruleAnchor } from "@/hooks/use-rule-jump"
import type { RuleTerm } from "@/lib/rules-terms"
import { cn } from "@/lib/utils"
import { RuleLinkedText } from "./RuleLinkedText"

type Props = { term: RuleTerm; highlighted: boolean; onVisit: (termId: string) => void }

// One term of the rules document, with the other terms in its text as links.
export function RuleEntry({ term, highlighted, onVisit }: Props) {
  const { id, entry } = term
  const link = (target: string, label: string) => (
    <button type="button" className="text-primary hover:underline" onClick={() => onVisit(target)}>
      {label}
    </button>
  )

  return (
    <section
      id={ruleAnchor(id)}
      className={cn("-mx-3 scroll-mt-28 rounded-lg px-3 py-3 transition-colors duration-700", highlighted && "bg-primary/10")}
    >
      <h3 className="text-lg font-semibold tracking-tight">{entry.title}</h3>
      <p className="text-muted-foreground mt-1 leading-relaxed">
        <RuleLinkedText text={entry.what} selfId={id} link={link} />
      </p>
      <p className="mt-2 leading-relaxed">
        <span className="font-medium">Used for: </span>
        <RuleLinkedText text={entry.use} selfId={id} link={link} />
      </p>
      <p className="text-muted-foreground mt-2 text-xs">SRD 5.2.1 p. {entry.page}</p>
    </section>
  )
}
