import fs from "node:fs"
import path from "node:path"
import type { Plugin } from "vite"
import { fromThisMachine } from "./vite-local-only.ts"

const FILE = path.resolve(import.meta.dirname, "src/assets/map-stamps/stamps.json")
const MAX_BODY = 512 * 1024
const MAX_NAME = 40
const MAX_RINGS = 24
const MAX_POINTS = 6000

type Stamp = { id: string; name: string; aspect: number; rings: [number, number][][] }

function readStamps(): Stamp[] {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as Stamp[]
  } catch {
    return []
  }
}

const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "stamp"

const isNumber = (value: unknown): value is number => typeof value === "number" && Number.isFinite(value)

// An outline is rings of points in a box of 0 to 1 each way, each ring closed.
function validRings(rings: unknown): rings is [number, number][][] {
  if (!Array.isArray(rings) || rings.length === 0 || rings.length > MAX_RINGS) return false
  let points = 0
  for (const ring of rings) {
    if (!Array.isArray(ring) || ring.length < 4) return false
    points += ring.length
    for (const point of ring) {
      if (!Array.isArray(point) || point.length !== 2 || !point.every((value) => isNumber(value) && value >= -0.001 && value <= 1.001)) {
        return false
      }
    }
  }
  return points <= MAX_POINTS
}

const validName = (name: unknown): name is string =>
  typeof name === "string" && name.trim().length > 0 && name.trim().length <= MAX_NAME

// Development only. Lets the builder keep the islands of its shape library in
// src/assets/map-stamps/stamps.json (POST /__dev/land-stamp with { action: "add", name,
// aspect, rings }, { action: "rename", id, name } or { action: "delete", id }), and
// answers with the whole list. Changes to the file do not reload the page.
export function landStamps(): Plugin {
  return {
    name: "land-stamps",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__dev/land-stamp", (request, response) => {
        const reply = (status: number, body: unknown) => {
          response.statusCode = status
          response.setHeader("Content-Type", "application/json")
          response.end(JSON.stringify(body))
        }
        if (request.method !== "POST") return reply(405, { error: "POST only." })
        if (!fromThisMachine(request)) return reply(403, { error: "Only this machine can change stamps." })
        // A JSON body makes a page on another site ask first, which the server never allows.
        if (!request.headers["content-type"]?.startsWith("application/json")) return reply(415, { error: "JSON only." })

        let text = ""
        request.on("data", (chunk) => {
          text += chunk
          if (text.length > MAX_BODY) request.destroy()
        })
        request.on("end", () => {
          let body: { action?: unknown; id?: unknown; name?: unknown; aspect?: unknown; rings?: unknown }
          try {
            body = JSON.parse(text)
          } catch {
            return reply(400, { error: "That is not JSON." })
          }
          const stamps = readStamps()
          const at = stamps.findIndex(({ id }) => id === body.id)

          if (body.action === "add") {
            if (!validName(body.name)) return reply(400, { error: `A name is 1 to ${MAX_NAME} characters.` })
            if (!isNumber(body.aspect) || !(body.aspect >= 0.05 && body.aspect <= 20)) return reply(400, { error: "That proportion is not right." })
            if (!validRings(body.rings)) return reply(400, { error: "That outline is not right." })
            const base = slug(body.name)
            let id = base
            for (let n = 2; stamps.some((stamp) => stamp.id === id); n++) id = `${base}-${n}`
            stamps.push({ id, name: body.name.trim(), aspect: body.aspect, rings: body.rings })
          } else if (body.action === "rename") {
            if (at < 0) return reply(400, { error: "There is no such stamp." })
            if (!validName(body.name)) return reply(400, { error: `A name is 1 to ${MAX_NAME} characters.` })
            stamps[at].name = body.name.trim()
          } else if (body.action === "delete") {
            if (at < 0) return reply(400, { error: "There is no such stamp." })
            stamps.splice(at, 1)
          } else {
            return reply(400, { error: "That is not something to do." })
          }

          fs.writeFileSync(FILE, `${JSON.stringify(stamps)}\n`)
          reply(200, { stamps })
        })
      })
    },
    // The file is read fresh the next time it is asked for, but nothing is sent to the
    // open page: it has the new list from the reply already.
    handleHotUpdate({ file, modules, server }) {
      if (path.resolve(file) !== FILE) return
      modules.forEach((module) => server.moduleGraph.invalidateModule(module))
      return []
    },
  }
}
