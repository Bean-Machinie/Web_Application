import type { LucideIcon } from "lucide-react"

export type DeckCardData = { key: string; name: string; meta: string; image: string | null; icon: LucideIcon }

// A small playing card of the Compendium: its picture (or an icon), its name and one line about it.
export function DeckCard({ card }: { card: DeckCardData }) {
  const Icon = card.icon
  return (
    <div className="bg-card text-foreground flex size-full flex-col overflow-hidden rounded-xl border p-1 shadow-[0_10px_30px_-8px_rgb(0_0_0/0.6)]">
      <div className="bg-muted text-muted-foreground flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-lg">
        {card.image ? <img src={card.image} alt="" className="size-full object-cover" /> : <Icon className="size-6" />}
      </div>
      <div className="px-1 pt-1 pb-0.5">
        <div className="truncate text-[11px] leading-tight font-semibold">{card.name}</div>
        <div className="text-muted-foreground flex items-center gap-1 text-[9px]">
          <Icon className="size-2.5 shrink-0" />
          <span className="truncate">{card.meta}</span>
        </div>
      </div>
    </div>
  )
}
