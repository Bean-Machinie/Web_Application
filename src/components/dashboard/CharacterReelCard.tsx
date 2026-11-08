import { User } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { ReelCardData } from "@/lib/character-reel-cards"

// A character as a simple playing card: the portrait in a thin gilt frame, the name and one line
// under it at the left, where the card stays in sight when the next one lies over it.
// Without a picture it shows `icon`.
export function CharacterReelCard({ card, icon: Icon = User }: { card: ReelCardData; icon?: LucideIcon }) {
  return (
    <div className="bg-card size-full rounded-xl border p-1.5 shadow-[-10px_8px_24px_-8px_rgb(0_0_0/0.65)]">
      <div className="relative size-full overflow-hidden rounded-lg">
        {card.image ? (
          <img src={card.image} alt="" draggable={false} className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="bg-muted text-muted-foreground absolute inset-0 flex items-center justify-center">
            <Icon className="size-8" />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-1 rounded-md border border-[#f5b544]/30" />
        <div className="absolute inset-x-0 bottom-0 px-2.5 pb-2.5 text-white">
          <div className="text-[12px] leading-tight font-semibold break-words">{card.name}</div>
          <div className="my-1 flex w-1/2 items-center gap-1 text-[#f5b544]/70">
            <span className="size-1 rotate-45 bg-current" />
            <span className="h-px flex-1 bg-current" />
          </div>
          <div className="truncate text-[9px] text-white/70">{card.line}</div>
        </div>
      </div>
    </div>
  )
}
