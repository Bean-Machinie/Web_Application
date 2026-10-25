import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { SearchIcon } from "@/components/icons/SearchIcon"
import { Button } from "@/components/ui/button"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { origins } from "@/lib/character-grants"
import { KIND_TEXT, optionsOf } from "@/lib/quick-options"
import type { QuickKind } from "@/lib/quick-options"
import { chooseBackground, chooseClass, chooseSpecies } from "./builder-choose"
import type { SheetActions } from "./character-actions"
import { QuickOptionCard } from "./QuickOptionCard"
import { QuickOptionSheet } from "./QuickOptionSheet"

type Props = { kind: QuickKind; actions: SheetActions; onBack: () => void }

const CHOOSE = { class: chooseClass, species: chooseSpecies, background: chooseBackground }

// The page of one kind: a heading, a search and the options in two columns. Select saves the
// choice and goes back to the start page; Learn more opens the details beside the list.
export function QuickOptions({ kind, actions, onBack }: Props) {
  const [query, setQuery] = useState("")
  const [learning, setLearning] = useState<string | null>(null)
  const { noun, question } = KIND_TEXT[kind]
  const current = { class: origins(actions).cls, species: origins(actions).species, background: origins(actions).background }[kind]
  const needle = query.trim().toLowerCase()
  const options = optionsOf(kind).filter((option) => `${option.name} ${option.line}`.toLowerCase().includes(needle))

  function select(id: string) {
    CHOOSE[kind](actions, id)
    onBack()
  }

  return (
    <div className="mx-auto flex w-[1100px] max-w-full flex-col gap-6">
      <div className="flex flex-col items-start gap-3">
        <Button variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
          <ArrowLeft />
          Back
        </Button>
        <h1 className="text-2xl font-semibold tracking-tight">{question}</h1>
      </div>
      <InputGroup className="w-full sm:w-72">
        <InputGroupAddon>
          <HoverIcon icon={SearchIcon} size={16} />
        </InputGroupAddon>
        <InputGroupInput value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${noun.toLowerCase()}`} aria-label={`Search ${noun.toLowerCase()}`} />
      </InputGroup>
      {options.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {options.map((option) => (
            <QuickOptionCard key={option.id} option={option} selected={option.id === current?.id} onLearn={() => setLearning(option.id)} onSelect={() => select(option.id)} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">Nothing matches “{query}”.</p>
      )}
      <QuickOptionSheet kind={kind} id={learning} actions={actions} onClose={() => setLearning(null)} onSelect={select} />
    </div>
  )
}
