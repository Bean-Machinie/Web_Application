import fs from "node:fs"
import type { IncomingMessage } from "node:http"
import os from "node:os"
import path from "node:path"
import type { Plugin } from "vite"

const LIBRARY = path.resolve(import.meta.dirname, "src/assets/map-assets")
const FILE = path.join(LIBRARY, "sizes.json")
// An art id is "<category>/<file>"; nothing else can reach the disk.
const isAssetId = (id: string) => {
  const parts = id.split("/")
  return (
    parts.length === 2 &&
    parts.every((part) => part !== "" && !part.startsWith(".") && !part.includes("\\")) &&
    /\.(svg|png|webp|jpe?g)$/i.test(parts[1])
  )
}
const MIN_SIZE = 0.02
const MAX_SIZE = 5

// What the dev server may be asked while it is on the network (--host): only by this
// machine. This is the address the connection came from, which no header can change.
const own = new Set(
  Object.values(os.networkInterfaces())
    .flat()
    .map((entry) => entry?.address)
    .filter((address) => address !== undefined)
)
const fromThisMachine = (request: IncomingMessage) => {
  const address = (request.socket.remoteAddress ?? "").replace(/^::ffff:/, "")
  return address === "127.0.0.1" || address === "::1" || own.has(address)
}

function readSizes(): Record<string, number> {
  try {
    return JSON.parse(fs.readFileSync(FILE, "utf8")) as Record<string, number>
  } catch {
    return {}
  }
}

// Development only. Lets the builder write a piece of art's own size into sizes.json
// (POST /__dev/asset-size with { id, size }, size null to remove it), and answers
// with the whole table. Changes to the file do not reload the page.
export function assetSizes(): Plugin {
  return {
    name: "asset-sizes",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/__dev/asset-size", (request, response) => {
        const reply = (status: number, body: unknown) => {
          response.statusCode = status
          response.setHeader("Content-Type", "application/json")
          response.end(JSON.stringify(body))
        }
        if (request.method !== "POST") return reply(405, { error: "POST only." })
        if (!fromThisMachine(request)) return reply(403, { error: "Only this machine can set sizes." })
        // A JSON body makes a page on another site ask first, which the server never allows.
        if (!request.headers["content-type"]?.startsWith("application/json")) return reply(415, { error: "JSON only." })

        let text = ""
        request.on("data", (chunk) => {
          text += chunk
          if (text.length > 4096) request.destroy()
        })
        request.on("end", () => {
          let body: { id?: unknown; size?: unknown }
          try {
            body = JSON.parse(text)
          } catch {
            return reply(400, { error: "That is not JSON." })
          }
          const { id, size } = body
          if (typeof id !== "string" || !isAssetId(id) || !fs.existsSync(path.join(LIBRARY, id))) {
            return reply(400, { error: "That is not a piece of art in the library." })
          }
          const removing = size === null
          if (!removing && (typeof size !== "number" || !(size >= MIN_SIZE && size <= MAX_SIZE))) {
            return reply(400, { error: `A size is between ${MIN_SIZE} and ${MAX_SIZE}.` })
          }
          const sizes = readSizes()
          if (removing) delete sizes[id]
          else sizes[id] = size as number
          const sorted = Object.fromEntries(Object.entries(sizes).sort(([a], [b]) => a.localeCompare(b)))
          fs.writeFileSync(FILE, `${JSON.stringify(sorted, null, 2)}\n`)
          reply(200, { sizes: sorted })
        })
      })
    },
    // The file is read fresh the next time it is asked for, but nothing is sent to the
    // open page: it has the new sizes from the reply already.
    handleHotUpdate({ file, modules, server }) {
      if (path.resolve(file) !== FILE) return
      modules.forEach((module) => server.moduleGraph.invalidateModule(module))
      return []
    },
  }
}
