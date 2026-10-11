// The cursor of the lasso: a thin crosshair with a small plus beside it when it adds
// land, or a minus when it cuts, as Photoshop's lasso has. Each is drawn twice, in dark
// and then in light, so that it shows on any ground.
const ink = (path: string) =>
  `<g fill="none" stroke-linecap="round"><path d="${path}" stroke="#000" stroke-opacity=".6" stroke-width="3"/><path d="${path}" stroke="#fff" stroke-width="1.2"/></g>`

const CROSSHAIR = "M12 3v18M3 12h18"
const BADGE = { add: "M26 21v8M22 25h8", cut: "M22 25h8" }

const cursors = {
  add: cursorOf(BADGE.add),
  cut: cursorOf(BADGE.cut),
}

function cursorOf(badge: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">${ink(CROSSHAIR)}${ink(badge)}</svg>`
  // The crosshair's middle is the point the cursor points at.
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 12 12, crosshair`
}

export const lassoCursor = (cutting: boolean) => (cutting ? cursors.cut : cursors.add)
