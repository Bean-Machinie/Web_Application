import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { GameNoticeSection } from "@/components/dashboard/GameNoticeSection"
import { LegalToc } from "@/components/dashboard/LegalToc"
import type { TocItem } from "@/components/dashboard/LegalToc"
import { GAME_NOTICES, LEGAL_UPDATED } from "@/lib/legal-notices"

const TOC: TocItem[] = [
  { id: "game-content", label: "Game content" },
  ...GAME_NOTICES.map((notice) => ({ id: notice.id, label: notice.name, indent: true })),
]

export function Legal() {
  const { hash } = useLocation()

  // The router does not scroll to an anchor on its own.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView()
  }, [hash])

  return (
    <div className="mx-auto flex w-fit max-w-full gap-12">
      <LegalToc items={TOC} />
      <article className="flex w-[680px] max-w-full min-w-0 flex-col gap-8">
        <p className="text-muted-foreground text-xs">Last updated {LEGAL_UPDATED}</p>
        <h2 id="game-content" className="scroll-mt-[calc(var(--header-height)+1.5rem)] text-xl font-semibold tracking-tight">
          Game content
        </h2>
        {GAME_NOTICES.map((notice) => (
          <GameNoticeSection key={notice.id} notice={notice} />
        ))}
      </article>
    </div>
  )
}
