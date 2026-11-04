import { Extension, mergeAttributes, Node } from "@tiptap/react"

// The label is drawn by CSS, so it cannot be selected, copied or typed over.
const CALLOUT =
  "my-3 rounded-md px-4 py-3 before:mb-1 before:block before:text-[0.65rem] before:font-semibold before:tracking-wider before:uppercase"

// Text for the GM to read out to the table.
export const ReadAloud = Node.create({
  name: "readAloud",
  group: "block",
  content: "block+",
  defining: true,
  parseHTML: () => [{ tag: 'div[data-type="read-aloud"]' }],
  renderHTML: ({ HTMLAttributes }) => [
    "div",
    mergeAttributes(HTMLAttributes, {
      "data-type": "read-aloud",
      class: `${CALLOUT} border-primary/60 bg-primary/10 border-l-2 italic before:text-primary before:not-italic before:content-['Read_aloud']`,
    }),
    0,
  ],
})

// For the GM alone, whatever the page is set to: the database leaves it out of
// what a player is sent.
export const GmNote = Node.create({
  name: "gmNote",
  group: "block",
  content: "block+",
  defining: true,
  parseHTML: () => [{ tag: 'div[data-type="gm-note"]' }],
  renderHTML: ({ HTMLAttributes }) => [
    "div",
    mergeAttributes(HTMLAttributes, {
      "data-type": "gm-note",
      class: `${CALLOUT} bg-muted/60 text-muted-foreground border before:content-['GM']`,
    }),
    0,
  ],
})

// Every block can be marked for the GM only. "inherit" means it follows the
// page; "gm" is dropped from what players are sent. Nothing sets it yet.
export const BlockVisibility = Extension.create({
  name: "blockVisibility",
  addGlobalAttributes() {
    return [
      {
        types: [
          "paragraph",
          "heading",
          "bulletList",
          "orderedList",
          "blockquote",
          "codeBlock",
          "horizontalRule",
          "readAloud",
          "gmNote",
        ],
        attributes: {
          visibility: {
            default: "inherit",
            parseHTML: (element) => element.getAttribute("data-visibility") ?? "inherit",
            renderHTML: (attributes) =>
              attributes.visibility === "inherit" ? {} : { "data-visibility": attributes.visibility },
          },
        },
      },
    ]
  },
})
