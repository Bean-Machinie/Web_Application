import type { ReactNode } from "react"
import type { useQuickBuild } from "@/hooks/use-quick-build"
import type { Attention } from "@/lib/quick-attention"
import { cn } from "@/lib/utils"
import type { SheetActions } from "./character-actions"
import { QuickPicker } from "./QuickPicker"
import { QuickReview } from "./QuickReview"
import { QuickSentence } from "./QuickSentence"

type Props = {
  build: ReturnType<typeof useQuickBuild>
  actions: SheetActions
  // The character, shown above the options on a narrow screen, where there is no panel for it.
  card: ReactNode
  needs: Attention[]
  ready: boolean
  creating: boolean
  // Whether the sentence writes the word it suggests ahead of the caret.
  suggestions: boolean
  // The left panel is open, over the left of the centre.
  inset: boolean
  onSelect: (id: string) => void
  onLearn: (id: string) => void
  onPick: (pick: string) => void
  onCreate: () => void
}

// The centre of the Build workspace: the sentence, and under it the options of the word that is
// open, or the review when none is.
export function QuickBuildCentre({ build, actions, card, needs, ready, creating, suggestions, inset, onSelect, onLearn, onPick, onCreate }: Props) {
  // What is hovered always shows in the sentence; only the word it suggests can be turned off.
  const ghost = build.ghost && (suggestions || !build.ghost.suggested) ? build.ghost : null

  return (
    <main className={cn("min-w-0 flex-1 overflow-y-auto transition-[padding-left] duration-200 ease-linear [scrollbar-color:var(--border)_transparent] [scrollbar-gutter:stable_both-edges] [scrollbar-width:thin] motion-reduce:transition-none", inset && "pl-[14.75rem]")}>
      <div className="mx-auto flex max-w-4xl flex-col gap-6 p-4 min-[1000px]:p-8">
        <QuickSentence slots={build.slots} ghost={ghost} openId={build.open?.id ?? null} onToggle={build.toggle} />
        {card}
        <QuickPicker
          slot={build.open}
          previewId={build.previewId}
          actions={actions}
          idle={
            ready ? (
              <QuickReview values={actions.values} slots={build.slots} needs={needs} creating={creating} onOpen={build.show} onPick={onPick} onCreate={onCreate} />
            ) : (
              <p className="text-muted-foreground text-sm">Choose a word in the sentence to see its options.</p>
            )
          }
          onSelect={onSelect}
          onLearn={onLearn}
          onPreview={(id) => build.preview(build.open!.id, id)}
        />
      </div>
    </main>
  )
}
