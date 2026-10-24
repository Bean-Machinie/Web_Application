import { EyeOff } from "lucide-react"
import { NodeViewWrapper } from "@tiptap/react"
import type { NodeViewProps } from "@tiptap/react"
import { Link, useNavigate } from "react-router-dom"
import { useMentionEntries } from "@/hooks/use-mention-entries"
import { cn } from "@/lib/utils"
import { MODIFIER_KEY } from "@/lib/selection-hint"
import { WORLD_KINDS } from "@/lib/world-kinds"
import { useMentionScope } from "./useMentionScope"

const CHIP =
  "inline-flex items-center gap-1 rounded-md border px-1.5 py-px align-baseline text-[0.9em] leading-snug font-medium no-underline transition-colors"

// A mention as a chip. It shows the entry's current name when the entry is
// known, and the name it was given when not. A hidden entry is dashed with the
// Hidden icon, so a GM can see what players will read as plain text. A mention of
// an entry that is not here (deleted, or in another home) is dormant: to a GM it
// is its name with a dotted underline and a tooltip saying so, and it connects
// again when the entry or a copy of it arrives. Read-only, a mention is a link to
// the entry; being edited, a plain click only selects it, and Ctrl or Cmd with a
// click opens it, so a click never loses what is being typed.
export function MentionNodeView({ node, editor, selected }: NodeViewProps) {
  const scope = useMentionScope()
  const entries = useMentionEntries(scope)
  const navigate = useNavigate()
  const id = node.attrs.id as string
  const entry = entries?.find((candidate) => candidate.id === id)
  const name = entry?.name ?? (node.attrs.label as string)
  const hidden = !!entry && !!scope?.hasVisibility && !entry.revealed
  const Icon = entry ? WORLD_KINDS[entry.kind].icon : null
  // Read-only is what a player sees, and the database only leaves a mention in
  // what a player is sent when they may follow it, so it is a link whether or not
  // the list of entries has loaded, or has it. Being edited, it needs the list to
  // know the entry is still there.
  const readOnly = !editor.isEditable
  const href = scope && (entry || readOnly) ? `${scope.basePath}/${id}` : null
  // Once the entries are known, a mention of one that is not there is dormant. A
  // player is never sent one (it arrives as plain text), so this is for GMs, in the
  // editor and in a read view of theirs.
  if (entries && !entry && (!readOnly || scope?.canManage)) {
    const where = scope?.hasVisibility ? "this campaign" : "your library"
    return (
      <NodeViewWrapper as="span" className="inline">
        <span
          className="decoration-muted-foreground/70 underline decoration-dotted underline-offset-4"
          title={`Not linked: ${name} isn't in ${where}`}
        >
          {name}
        </span>
      </NodeViewWrapper>
    )
  }

  const className = cn(
    CHIP,
    !href && "border-transparent bg-muted text-muted-foreground",
    href && !hidden && "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15",
    hidden && "border-muted-foreground/60 text-muted-foreground border-dashed bg-transparent",
    selected && "ring-foreground/20 ring-2",
    // The editor's own text cursor would be inherited otherwise.
    href ? "cursor-pointer" : "cursor-default"
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
      {href && readOnly ? (
        <Link to={href} className={className}>
          {content}
        </Link>
      ) : (
        <span
          className={className}
          title={[
            hidden && "Hidden from players, who read this as plain text.",
            href && `${MODIFIER_KEY} click to open.`,
          ]
            .filter(Boolean)
            .join(" ") || undefined}
          onClick={(event) => href && (event.ctrlKey || event.metaKey) && navigate(href)}
        >
          {content}
        </span>
      )}
    </NodeViewWrapper>
  )
}
