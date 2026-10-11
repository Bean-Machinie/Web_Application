import type { IncomingMessage } from "node:http"
import os from "node:os"

// What the dev server may be asked while it is on the network (--host): only by this
// machine. This is the address the connection came from, which no header can change.
const own = new Set(
  Object.values(os.networkInterfaces())
    .flat()
    .map((entry) => entry?.address)
    .filter((address) => address !== undefined)
)

export const fromThisMachine = (request: IncomingMessage) => {
  const address = (request.socket.remoteAddress ?? "").replace(/^::ffff:/, "")
  return address === "127.0.0.1" || address === "::1" || own.has(address)
}
