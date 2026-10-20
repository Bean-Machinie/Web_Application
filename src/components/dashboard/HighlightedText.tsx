import { Fragment } from "react"

// The name with the letters the search matched in stronger type.
export function HighlightedText({ text, matched }: { text: string; matched: number[] }) {
  if (matched.length === 0) return <>{text}</>
  const hit = new Set(matched)

  return (
    <>
      {Array.from(text).map((letter, index) =>
        hit.has(index) ? (
          <span key={index} className="text-foreground font-semibold">
            {letter}
          </span>
        ) : (
          <Fragment key={index}>{letter}</Fragment>
        )
      )}
    </>
  )
}
