import * as L from "leaflet"

// Zoom that eases toward a goal on every frame, rather than Leaflet's fixed
// animation that starts only once the wheel has stopped. Scrolling just moves
// the goal, so the map follows the hand and settles softly.
//
// While it moves, Leaflet is left alone: it rounds every layer to whole pixels
// each time its view changes, and the layers then shimmer against each other.
// Instead the image is moved by one smooth transform, the pins are placed to
// the fraction of a pixel, and the grid redraws itself from viewOf. Leaflet is
// given the final view only when the glide settles.
type Goal = { zoom: number; anchor?: L.Point; center?: L.LatLng }
type Camera = { center: L.LatLng; zoom: number }
// Leaflet's own layout at the start, which the transforms are measured from.
type Base = Camera & { origin: L.Point; pos: L.Point }
type Glide = { goal: Goal | null; camera: Camera | null; base: Base | null; frame: number }

// Time for the map to cover about two thirds of the way to its goal.
const EASE_MS = 90
const WHEEL_ZOOM_PER_PX = 0.005
const PINCH_ZOOM_PER_PX = 0.015
// The glide ends once what is left would move the map by less than this.
const SETTLE_PX = 0.25

const glides = new WeakMap<L.Map, Glide>()

function glideOf(map: L.Map) {
  let glide = glides.get(map)
  if (!glide) {
    glide = { goal: null, camera: null, base: null, frame: 0 }
    glides.set(map, glide)
  }
  return glide
}

// Where the map is looking right now, mid-glide included.
export function viewOf(map: L.Map): Camera {
  return glides.get(map)?.camera ?? { center: map.getCenter(), zoom: map.getZoom() }
}

const clampZoom = (map: L.Map, zoom: number) =>
  Math.min(Math.max(zoom, map.getMinZoom()), map.getMaxZoom())

// Keeps the view inside the map's bounds, as Leaflet does, but only once.
function limit(map: L.Map, center: L.LatLng, zoom: number) {
  if (!map.options.maxBounds) return center
  const bounds = map.options.maxBounds as L.LatLngBounds
  const half = map.getSize().divideBy(2)
  const at = map.project(center, zoom)
  const min = map.project(bounds.getNorthWest(), zoom)
  const max = map.project(bounds.getSouthEast(), zoom)
  const fit = (value: number, low: number, high: number, reach: number) =>
    high - low < reach * 2 ? (low + high) / 2 : Math.min(Math.max(value, low + reach), high - reach)
  return map.unproject(
    L.point(fit(at.x, min.x, max.x, half.x), fit(at.y, min.y, max.y, half.y)),
    zoom
  )
}

function start(map: L.Map, glide: Glide) {
  if (glide.base) return
  const center = map.getCenter()
  const zoom = map.getZoom()
  glide.base = {
    center,
    zoom,
    origin: map.getPixelOrigin(),
    pos: L.DomUtil.getPosition(map.getPane("mapPane")!),
  }
  glide.camera = { center, zoom }
  const image = map.getPane("overlayPane")!
  image.style.transformOrigin = "0 0"
  // An open label would be left behind.
  map.eachLayer((layer) => layer.closeTooltip())
  map.fire("movestart")
}

// Puts the image and pins where the camera says, without asking Leaflet.
function show(map: L.Map, glide: Glide) {
  const { base, camera } = glide
  if (!base || !camera) return
  const scale = 2 ** (camera.zoom - base.zoom)
  const half = map.getSize().divideBy(2)
  const screen = map
    .project(base.center, camera.zoom)
    .subtract(map.project(camera.center, camera.zoom))
    .add(half)
  const anchor = map.project(base.center, base.zoom).subtract(base.origin)
  const shift = screen.subtract(base.pos).subtract(anchor.multiplyBy(scale))

  map.getPane("overlayPane")!.style.transform =
    `translate3d(${shift.x}px, ${shift.y}px, 0) scale(${scale})`
  map.eachLayer((layer) => {
    if (!(layer instanceof L.Marker)) return
    const icon = layer.getElement()
    if (!icon) return
    const point = map
      .project(layer.getLatLng(), base.zoom)
      .subtract(base.origin)
      .multiplyBy(scale)
      .add(shift)
    icon.style.transform = `translate3d(${point.x}px, ${point.y}px, 0)`
  })
  map.fire("glide")
}

// Hands the view over to Leaflet, which lays everything out afresh.
function settle(map: L.Map, glide: Glide) {
  cancelAnimationFrame(glide.frame)
  glide.frame = 0
  glide.goal = null
  const { camera } = glide
  if (!camera) return
  glide.camera = null
  glide.base = null
  const image = map.getPane("overlayPane")!
  image.style.transform = ""
  const center = limit(map, camera.center, camera.zoom)
  map.setView(center, camera.zoom, { animate: false })
  // Leaflet rounds where the view starts to whole pixels, which would nudge
  // everything by up to half a pixel. The pane takes the remainder back.
  const exact = map.project(center, camera.zoom).subtract(map.getSize().divideBy(2))
  L.DomUtil.setPosition(map.getPane("mapPane")!, map.getPixelOrigin().subtract(exact))
  // Leaflet re-places pins only when the zoom level changes. Ending at the
  // starting zoom just pans the pane, leaving glide's transforms offset.
  map.eachLayer((layer) => {
    if (layer instanceof L.Marker) layer.setLatLng(layer.getLatLng())
  })
}

function run(map: L.Map, glide: Glide) {
  if (glide.frame) return
  let last = performance.now()
  const step = (now: number) => {
    const { goal, camera } = glide
    if (!goal || !camera) {
      glide.frame = 0
      return
    }
    const ease = 1 - Math.exp(-(now - last) / EASE_MS)
    last = now
    const size = map.getSize()
    const zoomPx = Math.abs(goal.zoom - camera.zoom) * Math.LN2 * Math.max(size.x, size.y)
    const zoom = zoomPx < SETTLE_PX ? goal.zoom : camera.zoom + (goal.zoom - camera.zoom) * ease

    let center: L.LatLng
    if (goal.center) {
      center = L.latLng(
        camera.center.lat + (goal.center.lat - camera.center.lat) * ease,
        camera.center.lng + (goal.center.lng - camera.center.lng) * ease
      )
    } else {
      // The map point under the anchor stays under it.
      const offset = goal.anchor!.subtract(size.divideBy(2))
      const under = map.unproject(map.project(camera.center, camera.zoom).add(offset), camera.zoom)
      center = map.unproject(map.project(under, zoom).subtract(offset), zoom)
    }
    glide.camera = { center: limit(map, center, zoom), zoom }
    show(map, glide)

    const done =
      zoom === goal.zoom &&
      (!goal.center ||
        map.project(glide.camera.center, zoom).distanceTo(map.project(goal.center, zoom)) <
          SETTLE_PX)
    if (done) settle(map, glide)
    else glide.frame = requestAnimationFrame(step)
  }
  glide.frame = requestAnimationFrame(step)
}

// Zooms by a number of levels around a point in the view (the middle if none).
export function glideZoomBy(map: L.Map, delta: number, anchor?: L.Point) {
  const glide = glideOf(map)
  start(map, glide)
  const base = glide.goal && !glide.goal.center ? glide.goal.zoom : glide.camera!.zoom
  glide.goal = {
    zoom: clampZoom(map, base + delta),
    anchor: anchor ?? map.getSize().divideBy(2),
  }
  run(map, glide)
}

// Zooms to a level, around a point in the view (the middle if none). Called on every
// step of a slider, it simply moves the goal.
export function glideZoomTo(map: L.Map, zoom: number, anchor?: L.Point) {
  const glide = glideOf(map)
  start(map, glide)
  glide.goal = { zoom: clampZoom(map, zoom), anchor: anchor ?? map.getSize().divideBy(2) }
  run(map, glide)
}

// Sweeps the view to show some bounds.
export function glideToBounds(map: L.Map, bounds: L.LatLngBounds) {
  const glide = glideOf(map)
  start(map, glide)
  glide.goal = { zoom: clampZoom(map, map.getBoundsZoom(bounds)), center: bounds.getCenter() }
  run(map, glide)
}

// Wheel, trackpad pinch and double click drive the glide. Touching the map
// otherwise (to drag or pinch it) ends the glide where it is.
export function attachGlide(map: L.Map) {
  const element = map.getContainer()
  const glide = glideOf(map)

  const onWheel = (event: WheelEvent) => {
    event.preventDefault()
    const pixels = event.deltaMode === 1 ? event.deltaY * 33 : event.deltaY
    const rate = event.ctrlKey ? PINCH_ZOOM_PER_PX : WHEEL_ZOOM_PER_PX
    glideZoomBy(map, -pixels * rate, map.mouseEventToContainerPoint(event))
  }
  const onDoubleClick = (event: L.LeafletMouseEvent) => {
    glideZoomBy(map, 1, event.containerPoint)
  }
  const onPointerDown = () => {
    if (glide.base) settle(map, glide)
  }

  element.addEventListener("wheel", onWheel, { passive: false })
  element.addEventListener("pointerdown", onPointerDown, { capture: true })
  map.on("dblclick", onDoubleClick)
  return () => {
    element.removeEventListener("wheel", onWheel)
    element.removeEventListener("pointerdown", onPointerDown, { capture: true })
    map.off("dblclick", onDoubleClick)
    cancelAnimationFrame(glide.frame)
    glide.frame = 0
    glide.goal = null
    glide.camera = null
    glide.base = null
  }
}
