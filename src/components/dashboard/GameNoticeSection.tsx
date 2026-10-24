import type { GameNotice } from "@/lib/legal-notices"
import { NoticeText } from "./NoticeText"

export function GameNoticeSection({ notice }: { notice: GameNotice }) {
  return (
    <section id={notice.id} className="scroll-mt-[calc(var(--header-height)+1.5rem)] border-t pt-8">
      <h3 className="text-base font-semibold tracking-tight">{notice.name}</h3>
      <p className="text-muted-foreground mt-1 text-sm">{notice.uses}</p>
      <p className="mt-4 text-sm leading-7">
        <NoticeText text={notice.notice} />
      </p>
    </section>
  )
}
