type Props = {
  title: string
  // Null for people who may not rename.
  onChange: ((title: string) => void) | null
}

const HEADING = "text-3xl leading-tight font-bold tracking-tight break-words md:text-4xl"

// The page's title, large above the text. For a GM it is a box with no frame, so
// writing the title feels like writing the page; Enter moves on to the text.
export function JournalPageTitle({ title, onChange }: Props) {
  if (!onChange) return <h1 className={HEADING}>{title || "Untitled"}</h1>

  return (
    <input
      aria-label="Page title"
      placeholder="Untitled"
      maxLength={120}
      value={title}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if (event.key !== "Enter") return
        event.preventDefault()
        document.querySelector<HTMLElement>("[data-mention-root] .ProseMirror")?.focus()
      }}
      className={`${HEADING} placeholder:text-muted-foreground/60 w-full bg-transparent outline-none`}
    />
  )
}
