import stampsFile from "../../assets/map-stamps/stamps.json"
import { BASIC_STAMPS } from "./basic-shapes"
import type { SavedStamp, Stamp } from "./stamps"

// The stamps of the library: the basic shapes, and the islands kept in
// src/assets/map-stamps/stamps.json. The file is read once, and replaced as the dev
// server says it changes (see the functions below), so that a change shows at once, with no reload.
const asStamps = (saved: SavedStamp[]): Stamp[] => [
  ...BASIC_STAMPS,
  ...saved.map(({ id, name, aspect, rings }): Stamp => ({ id, name, group: "islands", aspect, rings })),
]

let list = asStamps(stampsFile as SavedStamp[])
const watchers = new Set<() => void>()

export const getStamps = () => list

export function subscribeStamps(watcher: () => void) {
  watchers.add(watcher)
  return () => {
    watchers.delete(watcher)
  }
}

async function ask(body: object) {
  const response = await fetch("/__dev/land-stamp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const reply = (await response.json().catch(() => null)) as { stamps?: SavedStamp[]; error?: string } | null
  if (!response.ok || !reply?.stamps) throw new Error(reply?.error ?? "The dev server did not save the stamp.")
  list = asStamps(reply.stamps)
  watchers.forEach((watcher) => watcher())
}

// Development only, through the dev server, which takes the stamp's name and
// outline and answers with the whole file.
export const saveStamp = (stamp: Omit<SavedStamp, "id">) => ask({ action: "add", ...stamp })
export const renameStamp = (id: string, name: string) => ask({ action: "rename", id, name })
export const deleteStamp = (id: string) => ask({ action: "delete", id })
