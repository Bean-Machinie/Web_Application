import type { TemplateEntry } from "@/lib/campaign-template-types"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { KindLabel } from "./KindLabel"

const capitalise = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

// The first paragraph of a rich text field, as plain text.
function firstText(value: unknown) {
  const doc = value as { content?: { content?: { text?: string }[] }[] } | null
  return doc?.content?.[0]?.content?.[0]?.text ?? null
}

// A small taste of a starter entry: a few facts and the start of its description. The
// private parts (secrets, voice) are left for after the campaign exists.
export function TemplateEntryPreview({ entry }: { entry: TemplateEntry }) {
  const facts = WORLD_KINDS[entry.kind].fields.flatMap((def) => {
    const field = entry.fields.find((candidate) => candidate.key === def.key)
    if (!def.summary || !field || field.private || typeof field.value !== "string") return []
    return [def.options?.find((option) => option.value === field.value)?.label ?? capitalise(field.value)]
  })
  const description = firstText(entry.fields.find((field) => field.key === "description")?.value)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-0.5">
        <span className="font-semibold">{entry.name}</span>
        <KindLabel kind={entry.kind} />
      </div>
      {facts.length > 0 && <p className="text-muted-foreground text-xs">{facts.join(" · ")}</p>}
      {description && <p className="line-clamp-4 text-sm leading-snug">{description}</p>}
    </div>
  )
}
