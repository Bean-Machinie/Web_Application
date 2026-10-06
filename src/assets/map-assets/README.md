# Map assets

The art that can be placed on maps in the map builder. Everything here shows up
in the builder's asset panel by itself: there is no list to edit.

## Adding art

1. Put an image in a folder named after its category:
   `src/assets/map-assets/<category>/<file>`
2. Reload the builder. That's it.

- **A new folder is a new category.** `bridges/` becomes a "Bridges" tab. Only
  one level of folders is read.
- **File names become display names.** `stone-bridge.png` is shown as
  "Stone bridge" (dashes and underscores become spaces, the extension goes).
- **Formats:** SVG is preferred: it stays sharp at any size the map is drawn
  at. SVGs need `width` and `height` attributes, which set the shape they are
  drawn at. PNG, WebP or JPG also work. Use transparent backgrounds. Raster art
  needs at least 512 px on the longest side, so it stays sharp when the map is
  rendered at its full size.

## How big art is when first placed

Each category has a default width on the canvas, in canvas pixels (the canvas
is 3072 to 3840 px wide). They are set in `src/lib/map-assets.ts`, in
`DEFAULT_WIDTH`. A category that is not listed there, such as a new folder, gets
the fallback width, `FALLBACK_WIDTH` (160 px). Add a line to `DEFAULT_WIDTH` to
give a category its own.

## Do not rename or move files that maps already use

A map stores each piece of art by its path under this folder
(for example `towns/castle.svg`). Renaming or moving a file would leave maps
that use it with a dashed placeholder box where the art was. Changing what a
file looks like is fine.

## Drawing order

You never order art by hand. Art is drawn in order of its bottom edge: what is
lower on the map is in front.
