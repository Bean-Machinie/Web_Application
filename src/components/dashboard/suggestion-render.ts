import { ReactRenderer } from "@tiptap/react"
import type { SuggestionProps } from "@tiptap/suggestion"
import type { ForwardRefExoticComponent, RefAttributes } from "react"

const GAP = 4

export type SuggestionListHandle = { onKeyDown: (event: KeyboardEvent) => boolean }
export type SuggestionListProps<Item, Picked> = { items: Item[]; command: (picked: Picked) => void }

// The picker lives inside the editor's own box, not on the page: a panel that
// is a dialog counts a click outside itself as a reason to close. Shared by
// everything typed after a character in the editor (@ and /).
export function suggestionRender<Item, Picked>(
  List: ForwardRefExoticComponent<
    SuggestionListProps<Item, Picked> & RefAttributes<SuggestionListHandle>
  >
) {
  return () => {
    let component: ReactRenderer<SuggestionListHandle, SuggestionListProps<Item, Picked>> | null = null

    function place(props: SuggestionProps<Item>) {
      const root = props.editor.view.dom.closest<HTMLElement>("[data-mention-root]")
      const caret = props.clientRect?.()
      if (!component || !root || !caret) return

      if (component.element.parentElement !== root) root.appendChild(component.element)
      const box = root.getBoundingClientRect()
      const style = component.element.style
      style.position = "absolute"
      style.zIndex = "60"
      style.left = `${caret.left - box.left}px`
      // Below the caret, or above it when the screen ends first.
      if (caret.bottom + 260 < window.innerHeight) {
        style.top = `${caret.bottom - box.top + GAP}px`
        style.bottom = ""
      } else {
        style.top = ""
        style.bottom = `${box.bottom - caret.top + GAP}px`
      }
    }

    return {
      onStart: (props: SuggestionProps<Item>) => {
        component = new ReactRenderer(List, { props, editor: props.editor })
        place(props)
      },
      onUpdate: (props: SuggestionProps<Item>) => {
        component?.updateProps(props)
        place(props)
      },
      onKeyDown: ({ event }: { event: KeyboardEvent }) =>
        component?.ref?.onKeyDown(event) ?? false,
      onExit: () => {
        component?.element.remove()
        component?.destroy()
        component = null
      },
    }
  }
}
