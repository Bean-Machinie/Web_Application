import { withPick } from "@/lib/quick-view"
import type { QuickView } from "@/lib/quick-view"
import { chooseApproach, chooseBackground, chooseClass, chooseLineage, chooseSpecies } from "./builder-choose"
import type { SheetActions } from "./character-actions"

// Stores the option chosen in a slot of the sentence.
export function commitPick(actions: SheetActions, view: QuickView, slot: string, id: string) {
  if (slot === "class") chooseClass(actions, id)
  else if (slot === "species") chooseSpecies(actions, id)
  else if (slot === "background") chooseBackground(actions, id)
  else if (slot === "approach") chooseApproach(actions, id)
  else if (slot === "lineage") chooseLineage(actions, id)
  else if (slot === "size") actions.onValue("size", id)
  else actions.onValue("languages", withPick(view, slot, id).languages)
}
