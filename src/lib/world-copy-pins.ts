import { supabase } from "./supabase"
import type { PlanRow } from "./world-copy-plan"
import { copyWorldImage, deleteWorldImages } from "./world-images"

// Files are copied a few at a time, so a big map does not wait on a long queue.
const AT_ONCE = 5

type Copied = { path: string; kind: PlanRow["kind"] }

async function copyFiles(jobs: { from: string; to: string; kind: PlanRow["kind"] }[], done: Copied[]) {
  for (let start = 0; start < jobs.length; start += AT_ONCE) {
    await Promise.all(
      jobs.slice(start, start + AT_ONCE).map(async (job) => {
        await copyWorldImage(job.from, job.to, job.kind)
        done.push({ path: job.to, kind: job.kind })
      })
    )
  }
}

// Copies the maps with their pins, the entries the pins link and theirs. The
// image files are copied first, then the database copies everything in one
// transaction, so a failure anywhere leaves no entry behind; the files copied
// so far are then removed again. Resolves to the new id of every source copied.
export async function copyMapsWithPins(
  mapIds: string[],
  folder: string,
  targetCampaign: string | null,
  plan: PlanRow[]
) {
  const fresh = plan.filter((row) => !row.existingId)
  const newIds: Record<string, string> = {}
  const imagePaths: Record<string, string> = {}
  const jobs: { from: string; to: string; kind: PlanRow["kind"] }[] = []

  for (const row of fresh) {
    const id = crypto.randomUUID()
    newIds[row.sourceId] = id
    if (!row.imagePath) continue
    const to = `${folder}/${id}/${row.imagePath.split("/").pop()}`
    imagePaths[row.sourceId] = to
    jobs.push({ from: row.imagePath, to, kind: row.kind })
  }

  const copied: Copied[] = []
  try {
    await copyFiles(jobs, copied)
    const { error } = await supabase.rpc("copy_maps_with_pins", {
      source_maps: mapIds,
      target_campaign: targetCampaign,
      new_ids: newIds,
      image_paths: imagePaths,
    })
    if (error) throw error
  } catch (failure) {
    await deleteWorldImages(copied).catch(() => {})
    throw failure
  }

  return new Map(Object.entries(newIds))
}
