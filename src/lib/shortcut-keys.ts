// A key and the modifiers held with it. "key" is what the key types, in lower
// case, so a binding follows the keyboard's layout: a letter, a digit or a
// symbol as it is printed ("v", "0", "["), or the name of one that types nothing
// ("space", "delete", "escape", "arrowleft"). Ctrl stands for Cmd as well.
export type Binding = { key: string; ctrl?: boolean; alt?: boolean; shift?: boolean }

export const keyOf = (event: KeyboardEvent) => (event.key === " " ? "space" : event.key.toLowerCase())

const isLetter = (key: string) => key.length === 1 && key.toLowerCase() !== key.toUpperCase()
const isDigit = (key: string) => /^\d$/.test(key)

// A symbol or digit is made with Shift on some keyboards and without it on
// others (? is Shift+/ on a US one), so for them Shift says nothing.
export const shiftIsImplied = (key: string) => key.length === 1 && !isLetter(key)

export function matches(binding: Binding, event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) !== Boolean(binding.ctrl)) return false
  if (event.altKey !== Boolean(binding.alt)) return false
  if (!shiftIsImplied(binding.key) && event.shiftKey !== Boolean(binding.shift)) return false
  if (keyOf(event) === binding.key) return true
  // Ctrl+Alt is AltGr on some keyboards, which can type something else, and a
  // digit may be on the numpad: digits are also known by where the key is.
  return isDigit(binding.key) && (event.code === `Digit${binding.key}` || event.code === `Numpad${binding.key}`)
}

const NAMES: Record<string, string> = {
  space: "Space",
  delete: "Del",
  backspace: "Backspace",
  escape: "Esc",
  arrowleft: "←",
  arrowright: "→",
  arrowup: "↑",
  arrowdown: "↓",
  "-": "−",
}

// The parts of a binding as it is shown: Ctrl+Shift+Z is ["Ctrl", "Shift", "Z"].
export function bindingParts(binding: Binding): string[] {
  const name = NAMES[binding.key] ?? (isLetter(binding.key) ? binding.key.toUpperCase() : binding.key)
  return [binding.ctrl && "Ctrl", binding.alt && "Alt", binding.shift && "Shift", name].filter(
    (part): part is string => Boolean(part)
  )
}

export const bindingText = (binding: Binding) => bindingParts(binding).join("+")

// A binding as it is kept: no flag that is off, and no Shift where it says nothing.
export function normalise(binding: Binding): Binding {
  const out: Binding = { key: binding.key }
  if (binding.ctrl) out.ctrl = true
  if (binding.alt) out.alt = true
  if (binding.shift && !shiftIsImplied(binding.key)) out.shift = true
  return out
}

export function sameBinding(a: Binding, b: Binding) {
  const x = normalise(a)
  const y = normalise(b)
  return x.key === y.key && x.ctrl === y.ctrl && x.alt === y.alt && x.shift === y.shift
}

// Keys that are only held down for something else.
const HELD_FOR_OTHERS = new Set(["control", "shift", "alt", "meta", "altgraph", "os", "capslock", "dead", "process", "unidentified", "contextmenu"])

// The binding that a key press is, or null while it is only a modifier on its way
// to one. A digit is taken by where its key is, as matching does.
export function bindingFromEvent(event: KeyboardEvent): Binding | null {
  const key = keyOf(event)
  if (HELD_FOR_OTHERS.has(key)) return null
  const digit = /^(?:Digit|Numpad)(\d)$/.exec(event.code)?.[1]
  return normalise({
    key: digit ?? key,
    ctrl: event.ctrlKey || event.metaKey,
    alt: event.altKey,
    shift: event.shiftKey,
  })
}

// Why a binding cannot be had, or null if it can.
export function refusal(binding: Binding): string | null {
  if (binding.key === "tab" || binding.key === "enter") {
    return "Tab and Enter are for moving around and pressing buttons."
  }
  return null
}
