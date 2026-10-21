import { supabase } from "./supabase"
import type { WorldEntryKind } from "./world-kinds"

// One entry a copy reaches, as plan_entry_copy reports it.
export type PlanNode = {
  sourceId: string
  name: string
  kind: WorldEntryKind
  // Picked, as opposed to linked from something that was.
  isRoot: boolean
  // The copy already in the target, if there is one; links point at it.
  existingId: string | null
  imagePath: string | null
}

// A link from an entry that would be copied to something in the plan.
export type PlanEdge = { sourceId: string; targetId: string; type: "pin" | "mention" }

export type Plan = { nodes: PlanNode[]; edges: PlanEdge[] }

type Stored = {
  nodes: {
    source_id: string
    name: string
    kind: WorldEntryKind
    is_root: boolean
    existing_id: string | null
    image_path: string | null
  }[]
  edges: { source_id: string; target_id: string; link_type: PlanEdge["type"] }[]
}

// targetCampaign null is the person's library.
export async function fetchCopyPlan(entryIds: string[], targetCampaign: string | null) {
  const { data, error } = await supabase.rpc("plan_entry_copy", {
    source_entries: entryIds,
    target_campaign: targetCampaign,
  })
  if (error) throw error

  const stored = data as Stored
  return {
    nodes: stored.nodes.map(
      (node): PlanNode => ({
        sourceId: node.source_id,
        name: node.name,
        kind: node.kind,
        isRoot: node.is_root,
        existingId: node.existing_id,
        imagePath: node.image_path,
      })
    ),
    edges: stored.edges.map(
      (edge): PlanEdge => ({ sourceId: edge.source_id, targetId: edge.target_id, type: edge.link_type })
    ),
  } satisfies Plan
}

// Linked entries that would be copied, as opposed to ones already in the target.
export const newEntries = (plan: Plan) =>
  plan.nodes.filter((node) => !node.isRoot && !node.existingId)

export type Reach = {
  // Linked entries that will be copied: ticked, and reached through the picked
  // entries or others that will be copied.
  included: Set<string>
  // Linked entries that were not ticked, or are reached only through one that
  // was not.
  left: Set<string>
  // Entries the target already has a copy of, linked from something copied.
  present: Set<string>
}

// What the selection comes to. Whether an entry comes along is its own tick and
// whether something that comes along links to it, so an entry with two ways in
// stays while one of them does, and returns when one comes back.
export function reachFrom(plan: Plan, unticked: ReadonlySet<string>): Reach {
  const byId = new Map(plan.nodes.map((node) => [node.sourceId, node]))
  const included = new Set<string>()
  const present = new Set<string>()
  const queue = plan.nodes.filter((node) => node.isRoot).map((node) => node.sourceId)

  for (let next = 0; next < queue.length; next += 1) {
    for (const edge of plan.edges) {
      if (edge.sourceId !== queue[next]) continue
      const target = byId.get(edge.targetId)
      if (!target || target.isRoot) continue
      if (target.existingId) present.add(target.sourceId)
      else if (!unticked.has(target.sourceId) && !included.has(target.sourceId)) {
        included.add(target.sourceId)
        queue.push(target.sourceId)
      }
    }
  }

  const left = new Set(newEntries(plan).map((node) => node.sourceId).filter((id) => !included.has(id)))
  return { included, left, present }
}

// Why an entry comes along: what links to it among what is being copied.
export function reasonsFor(plan: Plan, entryId: string, reach: Reach) {
  const byId = new Map(plan.nodes.map((node) => [node.sourceId, node]))
  const copied = (id: string) => byId.get(id)?.isRoot || reach.included.has(id)
  const names = (type: PlanEdge["type"]) => [
    ...new Set(
      plan.edges
        .filter((edge) => edge.targetId === entryId && edge.type === type && copied(edge.sourceId))
        .map((edge) => byId.get(edge.sourceId)?.name ?? "")
    ),
  ]
  return { pinnedOn: names("pin"), mentionedIn: names("mention") }
}
