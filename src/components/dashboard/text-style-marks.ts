import { Mark, mergeAttributes } from "@tiptap/react"

// A mark that is one CSS property on a span, carried in the document as that value.
// Made here, and not from packages, since each is a few lines.
function styleMark(name: string, attribute: string, property: string, className?: string) {
  return Mark.create({
    name,
    addAttributes() {
      return {
        [attribute]: {
          default: null,
          parseHTML: (element) => element.style.getPropertyValue(property) || null,
          renderHTML: (attributes) => (attributes[attribute] ? { style: `${property}: ${attributes[attribute]}` } : {}),
        },
      }
    },
    parseHTML() {
      return [{ tag: "span", getAttrs: (element) => (element.style.getPropertyValue(property) ? null : false) }]
    },
    renderHTML({ HTMLAttributes }) {
      return ["span", mergeAttributes(HTMLAttributes, className ? { class: className } : {}), 0]
    },
  })
}

export const FontSize = styleMark("fontSize", "size", "font-size")
export const FontFamily = styleMark("fontFamily", "family", "font-family")
export const TextColor = styleMark("textColor", "color", "color")
// Cloned, so a highlight that wraps onto the next line keeps its rounding and padding.
export const Highlight = styleMark("highlight", "color", "background-color", "rounded-sm px-0.5 [box-decoration-break:clone]")

export const TEXT_STYLE_MARKS = [FontSize, FontFamily, TextColor, Highlight]
