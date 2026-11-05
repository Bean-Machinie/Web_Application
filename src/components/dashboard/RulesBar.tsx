import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

type Props = { query: string; onQuery: (query: string) => void; letters: string[]; onLetter: (letter: string) => void }

// The top of the rules document, which stays in view: the search and the letters to jump to.
export function RulesBar({ query, onQuery, letters, onLetter }: Props) {
  return (
    <div className="bg-background sticky top-0 z-10 -mx-4 grid gap-2 border-b px-4 py-3 md:-mx-8 md:px-8">
      <div className="relative">
        <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2" />
        <Input aria-label="Search the rules" placeholder="Search the rules…" value={query} onChange={(event) => onQuery(event.target.value)} className="pl-8" />
      </div>
      {letters.length > 0 && (
        <nav aria-label="Jump to a letter" className="flex flex-wrap gap-0.5">
          {letters.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => onLetter(letter)}
              className="text-muted-foreground hover:bg-muted hover:text-foreground size-6 rounded-md text-xs font-medium"
            >
              {letter}
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
