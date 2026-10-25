import { cloneElement } from "react"
import type { ReactElement } from "react"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card"
import type { Explanation } from "@/lib/character-glossary"
import { cn } from "@/lib/utils"

type Props = { explanation: Explanation | null; children: ReactElement }

// A label that explains itself on hover, the same way everywhere: what it is, what it is
// used for, the calculation with this character’s numbers, and where the SRD says so. A
// label the SRD has nothing on stays as it is.
export function GlossaryLabel({ explanation, children }: Props) {
  if (!explanation) return children
  const { entry, yours } = explanation

  return (
    <HoverCard>
      {/* A dotted underline and the help cursor say there is more; focus opens it too. */}
      <HoverCardTrigger asChild>
        {cloneElement(children as ReactElement<{ className?: string; tabIndex?: number }>, {
          className: cn(
            (children.props as { className?: string }).className,
            "decoration-muted-foreground/60 cursor-help underline decoration-dotted underline-offset-4 outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring"
          ),
          tabIndex: 0,
        })}
      </HoverCardTrigger>
      <HoverCardContent className="w-80 max-w-[320px]">
        <div className="grid gap-1">
          <p className="font-medium">{entry.title}</p>
          <p className="text-muted-foreground">{entry.what}</p>
        </div>
        <p>
          <span className="text-muted-foreground">Used for: </span>
          {entry.use}
        </p>
        {yours.length > 0 && (
          <div className="bg-muted grid gap-0.5 rounded-md px-2.5 py-2">
            <p className="text-muted-foreground text-xs font-medium">Your value</p>
            {yours.map((line) => (
              <p key={line} className="text-sm tabular-nums">
                {line}
              </p>
            ))}
          </div>
        )}
        <p className="text-muted-foreground text-xs">SRD 5.2.1 p. {entry.page}</p>
      </HoverCardContent>
    </HoverCard>
  )
}
