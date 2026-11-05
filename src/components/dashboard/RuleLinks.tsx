import { ruleEntry } from "@/lib/rules-terms"

type Props = { ids: string[]; onSelect: (termId: string) => void }

// Links to other entries by id, as one line separated by dots.
export function RuleLinks({ ids, onSelect }: Props) {
  return (
    <>
      {ids.map((id, index) => (
        <span key={id}>
          {index > 0 && " · "}
          <button type="button" className="text-foreground cursor-pointer hover:underline" onClick={() => onSelect(id)}>
            {ruleEntry(id)?.title}
          </button>
        </span>
      ))}
    </>
  )
}
