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
// Only a background colour: no padding, margin or rounding, which would take room from the
// text and open a gap where a highlight starts or ends in the middle of a word.
export const Highlight = styleMark("highlight", "color", "background-color")

export const TEXT_STYLE_MARKS = [FontSize, FontFamily, TextColor, Highlight]
