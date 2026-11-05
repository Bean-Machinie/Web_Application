import { ChevronLeft, Dices } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GLOSSARY_TERMS, glossaryIdFor } from "@/lib/glossary-terms"
import { ruleTerm } from "@/lib/rules-terms"
import { DiceText } from "./DiceText"
import { RuleLinkedText } from "./RuleLinkedText"

type Props = {
  termId: string
  onSelect: (termId: string) => void
  // Set when the list is not beside the term: a way back to it.
  onBack?: () => void
}

// The other terms a term's text mentions, in the order they first appear.
function relatedIds(text: string, selfId: string) {
  const ids = [...text.matchAll(GLOSSARY_TERMS)].map((found) => glossaryIdFor(found[0]))
  return [...new Set(ids)].filter((id): id is string => !!id && id !== selfId)
}

// One term: its definition, how it works, an example, and the terms it mentions.
export function RuleTermView({ termId, onSelect, onBack }: Props) {
  const term = ruleTerm(termId)
  if (!term) return null
  const { id, entry } = term
  const related = relatedIds(`${entry.what} ${entry.use}`, id)

  const link = (target: string, label: string) => (
    <button
      type="button"
      onClick={() => onSelect(target)}
      className="decoration-muted-foreground/60 hover:decoration-foreground cursor-pointer underline decoration-dotted underline-offset-4"
    >
      {label}
    </button>
  )

  return (
    <article className="flex max-w-prose flex-col gap-8 text-sm font-normal">
      {onBack && (
        <Button variant="ghost" size="sm" className="text-muted-foreground -mb-3 -ml-2 self-start" onClick={onBack}>
          <ChevronLeft /> All rules
        </Button>
      )}
      <header className="grid gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">{entry.title}</h1>
        <p className="text-base leading-relaxed">
          <RuleLinkedText text={entry.what} selfId={id} link={link} />
        </p>
      </header>
      <section className="grid gap-2">
        <h2 className="text-sm font-semibold">How it works</h2>
        <p className="leading-relaxed">
          <RuleLinkedText text={entry.use} selfId={id} link={link} />
        </p>
      </section>
      {entry.example && (
        <aside className="bg-muted/40 rounded-lg border px-4 py-3">
          <p className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium">
            <Dices className="size-3.5" /> Example
          </p>
          <p className="leading-relaxed">
            <DiceText text={entry.example} />
          </p>
        </aside>
      )}
      {related.length > 0 && (
        <p className="text-muted-foreground text-sm">
          See also:{" "}
          {related.map((target, index) => (
            <span key={target}>
              {index > 0 && " · "}
              <button type="button" onClick={() => onSelect(target)} className="text-foreground cursor-pointer hover:underline">
                {ruleTerm(target)?.entry.title}
              </button>
            </span>
          ))}
        </p>
      )}
    </article>
  )
}
