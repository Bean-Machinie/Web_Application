import type { RawEntry } from "./goblin-arrows-raw"

export const GOBLIN_NPCS: RawEntry[] = [
  {
    key: "gundren",
    kind: "npc",
    name: "Gundren Rockseeker",
    description: "A dwarf prospector with ink-stained fingers and a habit of grinning when he thinks nobody is looking. Hired the party in Neverwinter.",
    role: "Patron",
    notes: "Captured on the road. Taken with his map to @{grol} at Cragmaw Castle. He and his brothers have found the entrance to @{wave-echo}.",
  },
  {
    key: "sildar",
    kind: "npc",
    name: "Sildar Hallwinter",
    description: "A grey-bearded human soldier, nearly fifty, polite even with a split lip. Rode ahead with Gundren.",
    role: "Escort, possible party member",
    location: "@{hideout}, Goblin Den (area 6)",
    notes: `
- Condition: prisoner, beaten, 1 hit point.
- Faction: Lords' Alliance agent.
- Wants: to find @{iarno}, a fellow agent who went silent in Phandalin; to help Gundren reopen the mine.
- Knows: the Rockseekers found @{wave-echo}; the goblins were told to capture Gundren for "the Black Spider" (@{black-spider}); Gundren's map went to Cragmaw Castle; his contact in Phandalin is Iarno.
- Offers: 50 gp to be escorted to Phandalin, paid a day after arrival.
- When rescued, reveal the page "What Sildar tells you".
`,
  },
  {
    key: "yeemik",
    kind: "npc",
    name: "Yeemik",
    revealed: false,
    description: "A wiry goblin with a chipped tooth and a talent for saying what you want to hear.",
    role: "Second-in-command of the hideout",
    location: "@{hideout}, Goblin Den (area 6)",
    notes: `
- Stats: SRD Goblin Boss.
- Wants: Klarg dead and his own name on the plunder.
- Will offer Sildar for Klarg's head, then raise the price after the deal is done.
- Carries: a pouch with three gold teeth and some silver.
`,
  },
  {
    key: "klarg",
    kind: "npc",
    name: "Klarg",
    revealed: false,
    description: "A bugbear who talks about himself in the third person and has already picked out where his throne will stand.",
    role: "Leader of the hideout",
    location: "@{hideout}, Klarg's Cave (area 8)",
    notes: `
- Stats: SRD Bugbear Warrior. Pet wolf: @{ripper}.
- Voice: loud, theatrical, always "Klarg". Example: "Klarg sees you, little thieves."
- Answers to @{grol}. Flees down the chimney to area 3 if Ripper dies.
`,
  },
  {
    key: "ripper",
    kind: "npc",
    name: "Ripper",
    revealed: false,
    description: "Klarg's mangy wolf, missing half an ear.",
    notes: "Stats: SRD Wolf. Stays at Klarg's side.",
  },
  {
    key: "grol",
    kind: "npc",
    name: "King Grol",
    revealed: false,
    description: "Chief of the Cragmaw tribe.",
    notes: "Rules from Cragmaw Castle, about twenty miles northeast of the hideout. Holds Gundren and the map. Part 3 of the adventure.",
  },
  {
    key: "iarno",
    kind: "npc",
    name: "Iarno Albrek",
    revealed: false,
    description: "A human wizard of the Lords' Alliance sent to bring order to Phandalin.",
    notes: "Has gone missing. Sildar wants to find him. His real fate is part of Part 2; for this test he is a name only.",
  },
  {
    key: "barthen",
    kind: "npc",
    name: "Elmar Barthen",
    description: "Owner of Barthen's Provisions in Phandalin. Expecting Gundren's wagon.",
    notes: "If the party skips the cave, he tells them Gundren never arrived and sends them back to the ambush site.",
  },
]
