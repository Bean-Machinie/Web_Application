import { character, entry } from "./campaign-template-types"
import type { CampaignTemplate } from "./campaign-template-types"

// Generic and system-agnostic on purpose. Everything starts hidden.
export const STARTER_VILLAGE: CampaignTemplate = {
  id: "starter-village",
  name: "Starter village",
  description: "A small village with a handful of people, places and a local legend.",
  entries: [
    character(
      "Bram Hollis",
      { role: "Innkeeper", status: "alive", attitude: "friendly" },
      "Warm, talkative owner of the village inn. Knows everyone's business.",
      "Owes a dangerous debt to someone in the next town."
    ),
    character(
      "Tessa Vale",
      { role: "Traveling merchant", status: "alive", attitude: "neutral" },
      "Sells odd goods from a wagon and always has a rumor to trade.",
      "Some of her stock was stolen."
    ),
    character(
      "Captain Mara Dorn",
      { role: "Guard captain", status: "alive", attitude: "neutral" },
      "Stern but fair. Keeps the village gate and the peace.",
      "Quietly looks away from the smugglers on the Forest Road."
    ),
    character(
      "Elder Osric",
      { role: "Village elder", status: "alive", attitude: "friendly" },
      "Keeper of the village's stories, and slow to trust outsiders.",
      "Knows the truth behind the Lantern of Willowbrook."
    ),
    character(
      "Kestrel",
      { role: "Mysterious stranger", status: "alive", attitude: "neutral" },
      "A hooded traveler who arrived last week and asks careful questions.",
      "Is searching for the Old Map."
    ),
    entry("creature", "Wolf", "A lean grey wolf, bold when hungry. Stalks the Forest Road at dusk."),
    entry("creature", "Goblin", "A sly scavenger that raids camps and trades in trinkets."),
    entry("location", "Willowbrook", "A small farming village at a crossroads, ringed by old stone walls."),
    entry("location", "The Sleeping Fox", "A cozy inn with a roaring hearth, where the village gathers."),
    entry("location", "Forest Road", "A winding road through dark woods, known for bandits and worse."),
    entry("item", "Healing Potion", "A small red vial that mends minor wounds."),
    entry("item", "Old Map", "A worn map marking a place nobody in the village can name."),
    entry(
      "lore",
      "The Lantern of Willowbrook",
      "Locals say a pale lantern leads travelers off the Forest Road. Regulars at the Sleeping Fox swear they have seen it, and Elder Osric hints it guards the place the Old Map points to."
    ),
  ],
}
