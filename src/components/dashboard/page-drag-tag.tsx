import { FileText } from "lucide-react"
import { createRoot } from "react-dom/client"
import { JournalTabOverlay } from "./JournalTabOverlay"
import { loadPagePreview } from "./journal-tab-kinds"

// What is carried when a page is dragged out of the tree: the same tab, lifted, as
// when a tab is carried between panes, with a card hanging from it in place of the
// panel, which a page that is not open does not have yet: the first lines of the page. Drawn into the box the
// drag gives, and taken away again by what this returns.
export const mountPageTag = (pageId: string, title: string) => (host: HTMLElement) => {
  const preview = { key: `page:${pageId}`, load: () => loadPagePreview(pageId) }
  const root = createRoot(host)
  root.render(<JournalTabOverlay label={{ title, icon: FileText }} source={null} preview={preview} />)
  return () => root.unmount()
}
