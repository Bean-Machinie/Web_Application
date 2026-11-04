import type { RawEntry } from "./goblin-arrows-raw"

export const GOBLIN_ITEMS: RawEntry[] = [
  {
    key: "gundren-map",
    kind: "item",
    name: "Gundren's Map",
    revealed: false,
    description: "A leather-cased map marking the way to Wave Echo Cave.",
    type: "Plot item",
    notes: "Taken from the ambush, sent with Gundren to @{grol}. The party finds only the empty case at @{ambush-site}.",
  },
  {
    key: "wagon",
    kind: "item",
    name: "Wagon of Supplies",
    description: "Two oxen and a wagon of flour, salted pork, ale, mining tools and lantern oil.",
    value: "100 gp in total",
    notes: "The party is paid 10 gp each for delivering it to @{barthen}.",
  },
  {
    key: "lionshield-goods",
    kind: "item",
    name: "Lionshield Crates",
    revealed: false,
    description: "Crates and sacks stamped with a blue lion.",
    notes: "Stolen from the Lionshield Coster. Returning them to Phandalin earns 50 gp and the company's goodwill.",
  },
  {
    key: "jade-frog",
    kind: "item",
    name: "Jade Frog",
    revealed: false,
    description: "A pocket-sized jade frog with tiny gold eyes.",
    value: "40 gp",
    notes: "In Klarg's chest, area 8.",
  },
  {
    key: "healing-potion",
    kind: "item",
    name: "Potion of Healing",
    description: "A small red vial that tastes of copper and mint.",
    notes: "SRD Potion of Healing. Two are in Klarg's chest.",
  },
]

export const GOBLIN_LORE: RawEntry[] = [
  {
    key: "cragmaw",
    kind: "lore",
    name: "The Cragmaw Tribe",
    revealed: false,
    description: "Goblins who file their teeth sharp and raid the trails around Phandalin.",
    notes: "Chain of command: @{grol} → @{klarg} → @{yeemik}. Yeemik wants Klarg's place.",
  },
  {
    key: "black-spider",
    kind: "lore",
    name: "The Black Spider",
    revealed: false,
    description: "A name the goblins whisper. Nobody in this part knows who it is.",
    notes: "Paying the Cragmaws to capture Gundren. True identity is revealed much later in the adventure.",
  },
  {
    key: "lords-alliance",
    kind: "lore",
    name: "Lords' Alliance",
    description: "An alliance of cities that keeps the roads and towns of the north safe, by force when needed.",
    notes: "@{sildar} and @{iarno} are agents.",
  },
]
