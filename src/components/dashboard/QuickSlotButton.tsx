import { motion } from "motion/react"
import { cn } from "@/lib/utils"

type Props = { word: string | null; placeholder: string; chosenId: string | null; slotId: string; open: boolean; onClick: () => void }

// One word of the sentence, in the sentence's own font and size. Filled, it is the chosen name
// with a solid 2px underline; empty, the placeholder in muted text with a dashed one. Hover,
// focus and the open picker give it a soft background. The solid underline shares its layoutId
// with the tile it was chosen from, so the tile settles into the sentence.
export function QuickSlotButton({ word, placeholder, chosenId, slotId, open, onClick }: Props) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-label={word ? `${placeholder}: ${word}. Change` : `Choose ${placeholder}`}
      onClick={onClick}
      className={cn(
        "hover:bg-accent focus-visible:bg-accent focus-visible:ring-ring relative -mx-1 inline-block rounded-md px-1 leading-[1.2] whitespace-nowrap outline-none focus-visible:ring-2",
        word ? "text-foreground" : "text-muted-foreground",
        open && "bg-accent"
      )}
    >
      {word ?? placeholder}
      {word && chosenId ? (
        <motion.span layoutId={`surface:${slotId}:${chosenId}`} className="bg-foreground absolute inset-x-1 -bottom-0.5 h-0.5 rounded-full" />
      ) : (
        <span aria-hidden className="border-muted-foreground/60 absolute inset-x-1 -bottom-0.5 border-b-2 border-dashed" />
      )}
    </button>
  )
}
