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
const shiftIsImplied = (key: string) => key.length === 1 && !isLetter(key)

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
