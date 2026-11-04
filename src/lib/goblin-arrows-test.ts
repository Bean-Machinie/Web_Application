// Test content based on Lost Mine of Phandelver (WotC). Remove or rename before public launch.
import type { CampaignTemplate, TemplatePage } from "./campaign-template-types"
import { GOBLIN_ENTRIES, GOBLIN_LABELS } from "./goblin-arrows-entries"
import { HIDEOUT } from "./goblin-arrows-pages-hideout"
import { PART_ONE, RUNNING } from "./goblin-arrows-pages-intro"
import { GOBLINS_KNOW, HANDOUT, SILDAR_TELLS } from "./goblin-arrows-pages-notes"
import { AMBUSH, TRAIL } from "./goblin-arrows-pages-trail"
import { markup } from "./template-markup"

const page = (title: string, revealed: boolean, source: string, children?: TemplatePage[]): TemplatePage => ({
  title,
  revealed,
  content: markup(source, GOBLIN_LABELS),
  children,
})

export const GOBLIN_ARROWS_TEST: CampaignTemplate = {
  id: "goblin-arrows-test",
  name: "Goblin Arrows (test)",
  description: "A road ambush, a goblin cave and a prisoner who knows too much. Test adventure for structure.",
  cover: "moss",
  entries: GOBLIN_ENTRIES,
  journalPages: [
    page("Running this adventure", false, RUNNING),
    page("Part 1: Goblin Arrows", false, PART_ONE, [
      page("Goblin Ambush", false, AMBUSH),
      page("Goblin Trail", false, TRAIL),
      page("Cragmaw Hideout", false, HIDEOUT),
      page("What the goblins know", false, GOBLINS_KNOW),
      page("What Sildar tells you", false, SILDAR_TELLS),
    ]),
    page("Player handout: The job", true, HANDOUT),
  ],
}
