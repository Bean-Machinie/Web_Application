import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { useAuth } from "@/auth/useAuth"
import { useSrdView } from "@/hooks/use-srd-view"
import { useWorldViewMode } from "@/hooks/use-world-view-mode"
import type { WorldViewMode } from "@/hooks/use-world-view-mode"
import { COMPENDIUM_GROUPS } from "@/lib/library-sections"
import { storage } from "@/lib/browser-storage"
import { nodeLabel } from "@/lib/library-tree"
import { compendiumVisitedKey } from "@/lib/onboarding"
import { isSrdNode, srdCount } from "@/lib/srd-items"
import { srdNodeId } from "@/lib/srd-paths"
import { CollectionPage } from "./CollectionPage"
import { LibraryDetail } from "./LibraryDetail"
import { LibraryNodeMenu } from "./LibraryNodeMenu"
import { LibrarySearch } from "./LibrarySearch"
import { LibraryTabsContext } from "./LibraryTabsContext"
import { LibraryToolbar } from "./LibraryToolbar"
import { SrdResults } from "./SrdResults"
import { useLibraryTabs } from "./useLibraryTabs"

// The compendium: the SRD's creatures and rules on the collection page the library has: the menu of nodes, the
// search and filter, the results, and the panel of tabs at the right. Its tabs are kept apart from
// the library's.
export function CompendiumPage() {
  const [params, setParams] = useSearchParams()
  const userId = useAuth().session!.user.id
  // The getting-started list on Home ticks once the compendium has been opened.
  useEffect(() => storage.setItem(compendiumVisitedKey(userId), "1"), [userId])
  const asked = params.get("section")
  const nodeId = asked && isSrdNode(asked) ? asked : srdNodeId("creatures")
  const [query, setQuery] = useState("")
  const srd = useSrdView(nodeId, query)
  const tabs = useLibraryTabs(nodeId, "rules-tabs")
  const [chosenMode, setMode] = useWorldViewMode()
  // Rules are text, so they are only ever a list; cards would show nothing a row does not.
  const onRules = srd.rules !== null
  const mode: WorldViewMode = onRules ? "list" : chosenMode === "graph" ? "grid" : chosenMode
  const modes: WorldViewMode[] = onRules ? ["list"] : ["list", "grid"]
  const item = tabs.activeTab?.id ?? null
  const tabsApi = useMemo(() => ({ activeId: item, openNew: tabs.openNew }), [item, tabs.openNew])
  const searching = query.trim() !== ""

  return (
    <LibraryTabsContext.Provider value={tabsApi}>
      <CollectionPage
        flush={mode === "list"}
        detail={tabs.tabs.length > 0 && <LibraryDetail tabs={tabs} entries={null} selecting={false} />}
        tabs={<LibraryNodeMenu groups={COMPENDIUM_GROUPS} active={nodeId} count={srdCount} onSelect={(id) => setParams({ section: id }, { replace: true })} />}
        actions={
          <>
            <LibrarySearch query={query} onQuery={setQuery} label={`Search ${nodeLabel(nodeId).toLowerCase()}`} />
            <LibraryToolbar filters={srd.filters} mode={mode} onMode={setMode} modes={modes} makes={[]} onNew={() => {}} />
          </>
        }
      >
        <SrdResults creatures={srd.creatures} rules={srd.rules} mode={mode} openId={item} showTag={!nodeId.startsWith("srd:rules:") || searching} />
      </CollectionPage>
    </LibraryTabsContext.Provider>
  )
}
