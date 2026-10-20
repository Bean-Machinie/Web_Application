// The cursor of the lasso: a thin crosshair with a plus beside it when it adds land, or a
// minus when it cuts, as Photoshop's lasso has. The badge is heavy, and the lines are
// drawn twice, in dark and then in light, so that they show on any ground.
const ink = (path: string, light: number, dark: number) =>
  `<g fill="none" stroke-linecap="round"><path d="${path}" stroke="#000" stroke-opacity=".6" stroke-width="${dark}"/><path d="${path}" stroke="#fff" stroke-width="${light}"/></g>`

const CROSSHAIR = "M14 3v22M3 14h22"
const BADGE = { add: "M25 28h6M28 25v6", cut: "M25 28h6" }
// Where the crosshair's middle is, which is the point the cursor points at.
const HOT_SPOT = 14

function cursorOf(badge: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">${ink(CROSSHAIR, 1.2, 3)}${ink(badge, 1.5, 3.2)}</svg>`
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") ${HOT_SPOT} ${HOT_SPOT}, crosshair`
}

const cursors = { add: cursorOf(BADGE.add), cut: cursorOf(BADGE.cut) }

export const lassoCursor = (cutting: boolean) => (cutting ? cursors.cut : cursors.add)
