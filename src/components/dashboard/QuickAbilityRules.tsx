import { useState } from "react"
import { HoverIcon } from "@/components/icons/HoverIcon"
import { InfoIcon } from "@/components/icons/InfoIcon"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { SegmentedControl } from "@/components/ui/segmented-control"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollShadow } from "./ScrollShadow"
import { GeneratingSection, ModifiersSection, ScoresSection } from "./AbilityRulesSections"

const SECTIONS = { scores: ScoresSection, modifiers: ModifiersSection, generating: GeneratingSection }
type Section = keyof typeof SECTIONS

// The rules behind the ability scores, from the SRD 5.2.1 (pp. 5, 6 and 21), in a panel opened from
// the header: what the scores are, how a modifier follows from one, and how they are generated.
export function QuickAbilityRules() {
  const [section, setSection] = useState<Section>("scores")
  const Body = SECTIONS[section]

  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" aria-label="Info">
              <HoverIcon icon={InfoIcon} />
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>The rules behind ability scores (SRD 5.2.1)</TooltipContent>
      </Tooltip>
      <PopoverContent align="end" className="h-[min(34rem,var(--radix-popover-content-available-height))] w-[26rem] gap-4 overflow-hidden p-4" onOpenAutoFocus={(event) => event.preventDefault()}>
        <header className="flex items-baseline justify-between gap-3">
          <h2 className="text-sm font-semibold">Ability scores</h2>
          <span className="text-muted-foreground text-xs">SRD 5.2.1 · pp. 5–6, 21</span>
        </header>
        <SegmentedControl
          aria-label="Rules section"
          value={section}
          onValueChange={setSection}
          options={[
            { value: "scores", label: "Scores" },
            { value: "modifiers", label: "Modifiers" },
            { value: "generating", label: "Generating" },
          ]}
        />
        {/* The same height for every section; a long one scrolls inside. */}
        <ScrollShadow key={section}>
          <Body />
        </ScrollShadow>
      </PopoverContent>
    </Popover>
  )
}
