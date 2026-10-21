import { supabase } from "./supabase"
import type { Plan, PlanNode } from "./world-copy-plan"
import { copyWorldImage, deleteWorldImages } from "./world-images"
import { errorMessage } from "./campaigns"
import { forgetMentionEntries } from "./mention-entries"

// Files are copied a few at a time, so a big map does not wait on a long queue.
const AT_ONCE = 5

type Copied = { path: string; kind: PlanNode["kind"] }
type Job = { node: PlanNode; to: string }

async function copyFiles(jobs: Job[], done: Copied[]) {
  for (let start = 0; start < jobs.length; start += AT_ONCE) {
    await Promise.all(
      jobs.slice(start, start + AT_ONCE).map(async ({ node, to }) => {
        try {
          await copyWorldImage(node.imagePath!, to, node.kind)
        } catch (failure) {
          throw new Error(`${node.name}: ${errorMessage(failure)}`)
        }
        done.push({ path: to, kind: node.kind })
      })
    )
  }
}

// Copies the picked entries and the linked ones that were kept. The image files
// are copied first, then the database copies everything in one transaction, so a
// failure anywhere leaves no entry behind; the files copied so far are then
// removed again. A failure says which entry it was on. Anything in the plan that
// is not picked and not in `keep` is left out: its pins are dropped and its
// mentions become plain text.
export async function copyEntriesWithLinks(
  pickedIds: string[],
  keep: string[],
  folder: string,
  targetCampaign: string | null,
  plan: Plan
) {
  const copying = plan.nodes.filter((node) => node.isRoot || keep.includes(node.sourceId))
  const newIds: Record<string, string> = {}
  const imagePaths: Record<string, string> = {}
  const jobs: Job[] = []

  for (const node of copying) {
    const id = crypto.randomUUID()
    newIds[node.sourceId] = id
    if (!node.imagePath) continue
    const to = `${folder}/${id}/${node.imagePath.split("/").pop()}`
    imagePaths[node.sourceId] = to
    jobs.push({ node, to })
  }

  const copied: Copied[] = []
  try {
    await copyFiles(jobs, copied)
    const { error } = await supabase.rpc("copy_entries_with_links", {
      source_entries: pickedIds,
      target_campaign: targetCampaign,
      new_ids: newIds,
      image_paths: imagePaths,
    })
    if (error) throw error
    forgetMentionEntries()
  } catch (failure) {
    await deleteWorldImages(copied).catch(() => {})
    throw failure
  }
}
