import { Dices } from "lucide-react"
import { RuleText } from "./RuleText"

type Props = { text: string; selfId: string; onSelect: (termId: string) => void }

// An example, in a callout of its own.
export function RuleExample({ text, selfId, onSelect }: Props) {
  return (
    <aside className="bg-muted/40 rounded-lg border px-4 py-3">
      <p className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium">
        <Dices className="size-3.5" /> Example
      </p>
      <p className="leading-relaxed">
        <RuleText text={text} selfId={selfId} onSelect={onSelect} />
      </p>
    </aside>
  )
}
