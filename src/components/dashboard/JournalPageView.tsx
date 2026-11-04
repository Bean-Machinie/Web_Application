import { FormAlert } from "@/components/auth/FormAlert"
import { Skeleton } from "@/components/ui/skeleton"
import { useJournalPage } from "@/hooks/use-journal-page"
import type { JournalTreeState } from "@/hooks/use-journal-tree"
import type { JournalNode } from "@/lib/journal"
import { JournalEmpty } from "./JournalEmpty"
import { JournalPageReader } from "./JournalPageReader"
import { JournalPageTitle } from "./JournalPageTitle"
import { JournalVisibility } from "./JournalVisibility"
import { RichTextEditor } from "./RichTextEditor"
import { SaveIndicator } from "./SaveIndicator"

type Props = { node: JournalNode; tree: JournalTreeState; canManage: boolean }

// One open page: title, then the text. A GM edits it, saved after a pause in
// typing; a player reads it. Use with key={node.id}.
export function JournalPageView({ node, tree, canManage }: Props) {
  const page = useJournalPage(node.id)

  if (page.missing) return <JournalEmpty canManage={canManage} hasPages />

  function rename(title: string) {
    tree.patch(node.id, { title })
    page.saveTitle(title)
  }

  return (
    <article className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-6 py-8">
      {canManage && (
        <div className="flex h-5 items-center justify-end gap-4">
          <SaveIndicator state={page.saveState} />
          <JournalVisibility revealed={node.revealed} onChange={(on) => tree.reveal(node.id, on)} />
        </div>
      )}
      <JournalPageTitle title={node.title} onChange={canManage ? rename : null} />
      {page.error && <FormAlert tone="error">{page.error}</FormAlert>}
      {page.content === null ? (
        !page.error && <Skeleton className="h-40 w-full" />
      ) : canManage ? (
        <RichTextEditor
          variant="page"
          value={page.content.value}
          label={node.title || "Page text"}
          placeholder="Type / for blocks, or @ to link an entry"
          context={{ folder: "", entryId: node.id }}
          onChange={page.saveContent}
        />
      ) : (
        <JournalPageReader value={page.content.value} />
      )}
    </article>
  )
}
