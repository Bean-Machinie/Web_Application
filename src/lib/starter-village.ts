import { character, entry, fact, statBlock } from "./campaign-template-types"
import type { CampaignTemplate } from "./campaign-template-types"

// Generic and system-agnostic on purpose. Everything starts hidden.
export const STARTER_VILLAGE: CampaignTemplate = {
  id: "starter-village",
  name: "Starter village",
  description: "A small village with a handful of people, places and a local legend.",
  portraits: "/templates/starter-village",
  entries: [
    character(
      "Bram Hollis",
      { role: "Innkeeper", species: "Human", age: "67", status: "alive", attitude: "friendly" },
      {
        description: "Warm, talkative owner of the village inn. Knows everyone's business.",
        motivation: "Keep the inn full and his debt quietly paid.",
        voice: "Booming laugh, wipes the bar while he talks",
        secret: "Owes a dangerous debt to someone in the next town.",
      }
    ),
    character(
      "Tessa Vale",
      { role: "Traveling merchant", species: "Witch", age: "152", status: "alive", attitude: "neutral" },
      {
        description: "Sells odd goods from a wagon and always has a rumor to trade.",
        motivation: "Sell her stock quickly and move on before questions start.",
        voice: "Fast patter, names a price before you ask",
        secret: "Some of her stock was stolen.",
      }
    ),
    character(
      "Captain Mara Dorn",
      { role: "Guard captain", species: "Human", age: "41", status: "alive", attitude: "neutral" },
      {
        description: "Stern but fair. Keeps the village gate and the peace.",
        motivation: "Keep the village safe, whatever it costs her conscience.",
        voice: "Clipped sentences, never raises her voice",
        secret: "Quietly looks away from the smugglers on the Forest Road.",
      }
    ),
    character(
      "Elder Osric",
      { role: "Village elder", species: "Human", age: "82", status: "alive", attitude: "friendly" },
      {
        description: "Keeper of the village's stories, and slow to trust outsiders.",
        motivation: "Pass the old stories to someone worthy before his time runs out.",
        voice: "Slow and deliberate, speaks in proverbs",
        secret: "Knows the truth behind the Lantern of Willowbrook.",
      }
    ),
    character(
      "Kestrel",
      { role: "Mysterious stranger", species: "Human", age: "40", status: "alive", attitude: "neutral" },
      {
        description: "A hooded traveler who arrived last week and asks careful questions.",
        motivation: "Find the Old Map and what it leads to.",
        voice: "Quiet and careful, answers questions with questions",
        secret: "Is searching for the Old Map.",
      }
    ),
    entry("creature", "Wolf", "A lean grey wolf, bold when hungry. Stalks the Forest Road at dusk.", [
      fact("type", "Beast"),
      fact("threat", "Low alone, serious in a pack", true),
      statBlock({ health: 11, defense: 12, speed: "40 ft" }, [
        ["Bite", "+4 to hit, 2d4+2 piercing"],
        ["Pack tactics", "Easier to hit when an ally is adjacent"],
      ]),
    ]),
    entry("creature", "Goblin", "A sly scavenger that raids camps and trades in trinkets.", [
      fact("type", "Humanoid"),
      fact("threat", "Low, higher in a raiding band", true),
      statBlock({ health: 7, defense: 13, speed: "30 ft" }, [
        ["Dagger", "+4 to hit, 1d4+2 piercing"],
        ["Nimble escape", "Slips away from a fight as a quick action"],
      ]),
    ]),
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
