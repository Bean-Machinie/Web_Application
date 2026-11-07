import { useMemo } from "react"
import { RECENCY_TEXT } from "@/lib/library-recency"
import { AddToCampaignDialog } from "./AddToCampaignDialog"
import { AddToCampaignNotice } from "./AddToCampaignNotice"
import { CollectionFilterPill } from "./CollectionFilterPill"
import { CopyWithLinksDialog } from "./CopyWithLinksDialog"
import { LibraryContent } from "./LibraryContent"
import { LibraryDetail } from "./LibraryDetail"
import { LibraryTabsContext } from "./LibraryTabsContext"
import { NewMapDialog } from "./NewMapDialog"
import { useLibraryPage } from "./useLibraryPage"
import { useNewCharacter } from "./useNewCharacter"
import { WorldBulkBar } from "./WorldBulkBar"
import { WorldBulkMenu } from "./WorldBulkMenu"
import { WorldEntryDialogs } from "./WorldEntryDialogs"

// The library laid out like the world: a menu of what is in it and a toolbar over the cards or list
// of the open node, and, once something is clicked, its panel of tabs at the right.
export function LibraryPage() {
  const page = useLibraryPage()
  const newCharacter = useNewCharacter()
  const { selection, addTo } = page
  const detail = page.tabs.tabs.length > 0
  const tabsApi = useMemo(() => ({ activeId: page.item, openNew: page.tabs.openNew }), [page.item, page.tabs.openNew])

  return (
    <LibraryTabsContext.Provider value={tabsApi}>
      <WorldBulkMenu selection={selection} bulk={page.bulk} onAddToCampaign={() => addTo.open(page.bulk.chosen)}>
      <LibraryContent
        page={page}
        onNewCharacter={newCharacter.open}
        detail={detail && <LibraryDetail tabs={page.tabs} entries={page.entries} selecting={selection.active} onAddToCampaign={(entry) => addTo.open([entry])} />}
      />
      </WorldBulkMenu>

      {page.recency !== "any" && (
        <CollectionFilterPill
          text={`Showing entries ${RECENCY_TEXT[page.recency]}`}
          raised={selection.active || addTo.notice !== null}
          onClear={() => page.setRecency("any")}
        />
      )}
      <WorldBulkBar selection={selection} bulk={page.bulk} onAddToCampaign={() => addTo.open(page.bulk.chosen)} />
      {addTo.notice && <AddToCampaignNotice notice={addTo.notice} />}
      <AddToCampaignDialog target={addTo} />
      <CopyWithLinksDialog {...addTo.copyDialog} />
      <NewMapDialog open={page.making} onClose={() => page.setMaking(false)} />
      {newCharacter.dialog}
      <WorldEntryDialogs
        renaming={page.renaming}
        deleting={page.removal.deleting}
        busy={page.removal.busy}
        reload={page.reload}
        onDelete={page.removal.confirm}
        onCloseRename={() => page.setRenaming(null)}
        onCloseDelete={() => page.removal.setDeleting(null)}
      />
    </LibraryTabsContext.Provider>
  )
}
