import { NodeViewWrapper } from "@tiptap/react"
import type { NodeViewProps } from "@tiptap/react"
import { EyeOff } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { useMentionEntries } from "@/hooks/use-mention-entries"
import { cn } from "@/lib/utils"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { useMentionScope } from "./useMentionScope"

const CHIP =
  "inline-flex items-center gap-1 rounded-md border px-1.5 py-px align-baseline text-[0.9em] leading-snug font-medium no-underline transition-colors"

// A mention as a chip. It shows the entry's current name when the entry is
// known, and the name it was given when not (an entry players cannot see, or one
// that is gone, is just that name). A hidden entry is dashed with the Hidden
// icon, so a GM can see what players will read as plain text. Read-only, it is
// a link to the entry; being edited, a plain click only selects it, and Ctrl or
// Cmd with a click opens it, so a click never loses what is being typed.
export function MentionNodeView({ node, editor, selected }: NodeViewProps) {
  const scope = useMentionScope()
  const entries = useMentionEntries(scope)
  const navigate = useNavigate()
  const id = node.attrs.id as string
  const entry = entries?.find((candidate) => candidate.id === id)
  const name = entry?.name ?? (node.attrs.label as string)
  const hidden = !!entry && !!scope?.hasVisibility && !entry.revealed
  const Icon = entry ? WORLD_KINDS[entry.kind].icon : null
  const href = entry && scope ? `${scope.basePath}/${entry.id}` : null

  const className = cn(
    CHIP,
    !entry && "border-transparent bg-muted text-muted-foreground",
    entry && !hidden && "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15",
    hidden && "border-muted-foreground/60 text-muted-foreground border-dashed bg-transparent",
    selected && "ring-foreground/20 ring-2"
  )
  const content = (
    <>
      {hidden ? (
        <EyeOff className="size-3 shrink-0" aria-label="Hidden from players" />
      ) : (
        Icon && <Icon className="size-3 shrink-0" />
      )}
      {name}
    </>
  )

  return (
    <NodeViewWrapper as="span" className="inline">
      {href && !editor.isEditable ? (
        <Link to={href} className={className}>
          {content}
        </Link>
      ) : (
        <span
          className={className}
          title={hidden ? "Hidden from players, who read this as plain text" : undefined}
          onClick={(event) => href && (event.ctrlKey || event.metaKey) && navigate(href)}
        >
          {content}
        </span>
      )}
    </NodeViewWrapper>
  )
}
