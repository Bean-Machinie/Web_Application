import type { ReactNode } from "react"
import { Fragment } from "react"
import { ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Tabs } from "@/components/ui/tabs"
import { useToolPanelLayout } from "@/hooks/use-tool-panel-layout"
import { MapPanelHandle } from "./MapPanelHandle"
import { MapPanelHeader, MapPanelTab, PANEL_SCROLL } from "./MapPanelHeader"

// A section with tabs shows the one that is active in its bar, and the content it is
// given is that tab's, the caller keeping which is active.
export type SectionTabs = { tabs: { id: string; title: string }[]; active: string; onPick: (id: string) => void }

export type ToolSection = { id: string; title: string; content: ReactNode; tabs?: SectionTabs }

type Props = { tool: string; sections: ToolSection[] }

// The sections of a tool, stacked like the groups of the right panel: a bar with
// the section's title, its own scroll, and a gutter between them to drag. A tool
// gets another section by adding one to the list it gives here.
export function MapToolSections({ tool, sections }: Props) {
  const layout = useToolPanelLayout(tool)
  const size = `${100 / sections.length}%`

  return (
    <ResizablePanelGroup
      orientation="vertical"
      defaultLayout={layout.defaultLayout}
      onLayoutChanged={layout.onLayoutChanged}
    >
      {sections.map((section, index) => (
        <Fragment key={section.id}>
          {index > 0 && (
            <MapPanelHandle />
          )}
          <ResizablePanel
            id={section.id}
            defaultSize={size}
            minSize={64}
            className="flex flex-col"
            style={{ overflow: "hidden" }}
          >
            <Tabs
              value={section.tabs?.active ?? section.id}
              onValueChange={section.tabs?.onPick}
              className="min-h-0 flex-1 gap-0"
            >
              <MapPanelHeader>
                {(section.tabs?.tabs ?? [{ id: section.id, title: section.title }]).map(({ id, title }) => (
                  <MapPanelTab key={id} value={id}>
                    {title}
                  </MapPanelTab>
                ))}
              </MapPanelHeader>
              <div className={PANEL_SCROLL}>{section.content}</div>
            </Tabs>
          </ResizablePanel>
        </Fragment>
      ))}
    </ResizablePanelGroup>
  )
}
