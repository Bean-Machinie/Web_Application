import type { RawEntry } from "./goblin-arrows-raw"

export const GOBLIN_CREATURES: RawEntry[] = [
  {
    key: "goblin",
    kind: "creature",
    name: "Goblin",
    description: "Small, quick and spiteful. Cragmaw goblins file their teeth to points.",
    notes: "Stats: SRD Goblin Warrior. Bows from cover, flee when outnumbered.",
  },
  {
    key: "wolf",
    kind: "creature",
    name: "Wolf",
    description: "Lean grey wolves the Cragmaws train for raids.",
    notes: "Stats: SRD Wolf.",
  },
  {
    key: "bugbear",
    kind: "creature",
    name: "Bugbear",
    description: "A big, hairy goblinoid that moves far more quietly than it should.",
    notes: "Stats: SRD Bugbear Warrior.",
  },
]

export const GOBLIN_LOCATIONS: RawEntry[] = [
  {
    key: "ambush-site",
    kind: "location",
    name: "Ambush Site on the Triboar Trail",
    description: "A bend in the trail where the woods crowd close and the banks rise steeply on both sides.",
    notes: 'Four @{goblin} hide here, two on each side. See the journal page "Goblin Ambush".',
  },
  {
    key: "goblin-trail",
    kind: "location",
    name: "Goblin Trail",
    revealed: false,
    description: "A narrow path hidden behind thickets north of the road.",
    notes: 'Runs five miles northwest to @{hideout}. Two traps: a snare, then a pit. See "Goblin Trail".',
  },
  {
    key: "hideout",
    kind: "location",
    name: "Cragmaw Hideout",
    revealed: false,
    description: "A cave in a hillside with a shallow stream running out of its mouth.",
    notes: "Base of Klarg's raiders. Eight keyed areas, see the journal page \"Cragmaw Hideout\".",
  },
  {
    key: "phandalin",
    kind: "location",
    name: "Phandalin",
    description: "A rough frontier town rebuilt on old ruins, a half-day east of the ambush site.",
    notes: "Part 2. In this test it is only the destination.",
  },
  {
    key: "wave-echo",
    kind: "location",
    name: "Wave Echo Cave",
    revealed: false,
    description: "A lost mine, said to hold a magical forge.",
    notes: "The goal of the whole adventure. The Rockseekers have found its entrance.",
  },
]
