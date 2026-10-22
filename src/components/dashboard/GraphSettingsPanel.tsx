import { useState } from "react"
import { Maximize, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { RANGES } from "@/lib/graph-settings"
import type { GraphSettings } from "@/lib/graph-settings"
import { GraphKindLegend } from "./GraphKindLegend"
import type { Legend } from "./GraphKindLegend"
import { GraphSliderRow } from "./GraphSliderRow"
import { GraphSwitchRow } from "./GraphSwitchRow"
import { THIN_SCROLL } from "./entry-layout"

type Props = {
  settings: GraphSettings
  onChange: (patch: Partial<GraphSettings>) => void
  onReset: () => void
  onFit: () => void
  legend: Legend
  // For a GM: look at the graph as a player would. Null for everyone else.
  player: { on: boolean; onChange: (on: boolean) => void } | null
}

type SliderName = keyof typeof RANGES

const SECTIONS: { title: string; sliders: { name: SliderName; label: string }[] }[] = [
  {
    title: "Display",
    sliders: [
      { name: "nodeSize", label: "Node size" },
      { name: "lineThickness", label: "Line thickness" },
      { name: "labelThreshold", label: "Label fade threshold" },
    ],
  },
  {
    title: "Forces",
    sliders: [
      { name: "centerForce", label: "Center force" },
      { name: "repelForce", label: "Repel force" },
      { name: "linkForce", label: "Link force" },
      { name: "linkDistance", label: "Link distance" },
    ],
  },
]

// In the top right corner of the graph, like the settings of Obsidian's graph: a
// button that frames everything and one that opens the panel. Its sections are
// Filters, Kinds, Display and Forces. Every change applies at once, and the settings
// are remembered in this browser.
export function GraphSettingsPanel({ settings, onChange, onReset, onFit, legend, player }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <Collapsible
      open={open}
      onOpenChange={setOpen}
      className="absolute top-3 right-3 z-10 flex max-h-[calc(100%-1.5rem)] w-60 flex-col items-end gap-2"
    >
      <div className="flex gap-1.5">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              aria-label="Fit to view"
              className="bg-card/90 backdrop-blur-sm"
              onClick={onFit}
            >
              <Maximize />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Fit to view</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <CollapsibleTrigger asChild>
              <Button
                variant="outline"
                size="icon-sm"
                aria-label="Graph settings"
                className="bg-card/90 backdrop-blur-sm"
              >
                <SlidersHorizontal />
              </Button>
            </CollapsibleTrigger>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
      </div>
      <CollapsibleContent
        className={`bg-card/95 min-h-0 w-full overflow-y-auto rounded-lg border shadow-md backdrop-blur-sm ${THIN_SCROLL}`}
      >
        <div className="flex items-center justify-between px-3 py-2">
          <h3 className="text-sm font-medium">Graph settings</h3>
          <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={onReset}>
            Reset
          </Button>
        </div>
        <Separator />
        <section className="grid gap-3 px-3 py-3">
          <h4 className="text-muted-foreground text-xs font-medium">Filters</h4>
          <GraphSwitchRow
            id="graph-show-loose"
            label="Show unconnected entries"
            checked={settings.showLoose}
            onChange={(showLoose) => onChange({ showLoose })}
          />
          {player && (
            <GraphSwitchRow
              id="graph-view-as-player"
              label="View as player"
              checked={player.on}
              onChange={player.onChange}
            />
          )}
        </section>
        <Separator />
        <section className="grid gap-3 px-3 py-3">
          <h4 className="text-muted-foreground text-xs font-medium">Kinds</h4>
          <GraphKindLegend {...legend} />
        </section>
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <Separator />
            <section className="grid gap-3 px-3 py-3">
              <h4 className="text-muted-foreground text-xs font-medium">{section.title}</h4>
              {section.sliders.map(({ name, label }) => (
                <GraphSliderRow
                  key={name}
                  id={`graph-${name}`}
                  label={label}
                  value={settings[name]}
                  {...RANGES[name]}
                  onChange={(value) => onChange({ [name]: value })}
                />
              ))}
            </section>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}
