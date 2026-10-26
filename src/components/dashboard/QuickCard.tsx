import type { ReactNode } from "react"
import { ScrollText, Swords, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { KIND_TEXT } from "@/lib/quick-options"
import type { QuickKind, QuickOption } from "@/lib/quick-options"
import { cn } from "@/lib/utils"

const ICONS = { class: Swords, species: Users, background: ScrollText }

type Props = {
  kind: QuickKind
  // What is chosen, or none yet.
  chosen: QuickOption | null
  // The muted line under a chosen name.
  line: string
  onOptions: () => void
  onView: () => void
  // The kind’s own quick choices, over the buttons once something is chosen.
  extra?: ReactNode
}

// One of the three choices of the start page: a picture (or the kind's icon on a dark
// surface) with the words on a soft fade at the bottom. Empty, it asks a question; chosen,
// it names the option and offers Change and View.
export function QuickCard({ kind, chosen, line, onOptions, onView, extra }: Props) {
  const { noun, question } = KIND_TEXT[kind]
  const Icon = ICONS[kind]

  return (
    <article
      aria-label={noun}
      className={cn("relative flex min-h-60 flex-1 flex-col justify-end overflow-hidden rounded-xl border bg-neutral-900 text-white", kind === "background" && "min-h-52")}
    >
      {chosen?.image ? (
        <img src={chosen.image} alt="" className="absolute inset-0 size-full object-cover" />
      ) : (
        <Icon aria-hidden className="absolute top-1/3 left-1/2 size-20 -translate-x-1/2 -translate-y-1/2 text-white/10" strokeWidth={1} />
      )}
      <div className="relative flex flex-col gap-3 bg-gradient-to-t from-black/85 via-black/60 to-transparent px-5 pt-16 pb-5">
        <div className="flex flex-col gap-0.5">
          <h2 className={cn("font-semibold tracking-tight", chosen ? "text-2xl" : "text-lg")}>{chosen ? chosen.name : `Choose ${noun}`}</h2>
          <p className="text-sm text-white/70">{chosen ? line : question}</p>
        </div>
        {chosen && extra}
        <div className="flex gap-2">
          {chosen ? (
            <>
              <Button variant="secondary" size="sm" onClick={onOptions}>Change</Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white" onClick={onView}>View</Button>
            </>
          ) : (
            <Button variant="secondary" size="sm" onClick={onOptions}>See options</Button>
          )}
        </div>
      </div>
    </article>
  )
}
