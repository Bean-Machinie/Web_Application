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
  drawn at. PNG, WebP or JPG also work. Raster art needs at least 512 px on the
  longest side, so it stays sharp when the map is rendered at its full size.

## The art rules

One drawing has to work on every biome, so art is **ink only**. The map adds the
colour: the lines are drawn in the map's ink colour, and the ground (land,
biome, texture) shows through wherever the art is solid.

- **Monochrome.** Black for ink lines. Greys are lighter ink: the darker a pixel,
  the stronger the ink. No colour: colour is read only by how dark it is, so a
  coloured fill would turn into a see-through blob of ink.
- **Pure white (`#fff`) where the shape is solid.** The ground shows through it,
  and it hides whatever is behind the art, with ground, not with white. A shape
  drawn only in outline, with no white inside, lets what is behind show through.
- **Transparent outside the shape.** Nothing is drawn there, and clicks go
  through it to whatever is behind.
- **A consistent line weight.** The coast is drawn at 2.5 px (the theme's
  `LINE_WEIGHT`, in `src/lib/map-theme.ts`), and art should match it at the size
  it is first placed. A piece is placed at its category's default width (below),
  so a line should be

  `2.5 × (the art's width ÷ the category's default width)`

  pixels wide in the SVG's own units. The easiest way is to draw the art at its
  category's default width with 2.5 px lines. Fine detail such as hatching can be
  about half that.
- **Light from the top left.** Shade the right and bottom of shapes, with light
  grey and hatching running down to the right, and leave the left and top
  white.
- **Several variants per type**, so a forest or a range of mountains does not
  look copy-pasted. Name them after the type with a number: `peak.svg`,
  `peak-2.svg`, `peak-3.svg`.
- **Gradients and transparency in the art** work, and are read like any other
  pixel by darkness and by opacity, but plain greys keep the line work clean.

## How big art is when first placed

Each category has a default width on the canvas, in canvas pixels (the canvas
is 3072 to 3840 px wide). They are set in `src/lib/map-assets.ts`, in
`DEFAULT_WIDTH`:

| Category    | Default width |
| ----------- | ------------- |
| `mountains` | 220 px        |
| `forests`   | 180 px        |
| `towns`     | 170 px        |

A category that is not listed there, such as a new folder, gets the fallback
width, `FALLBACK_WIDTH` (160 px). Add a line to `DEFAULT_WIDTH` to give a
category its own.

## Do not rename or move files that maps already use

A map stores each piece of art by its path under this folder
(for example `towns/castle.svg`). Renaming or moving a file would leave maps
that use it with a dashed placeholder box where the art was. Changing what a
file looks like is fine.

## Drawing order

You never order art by hand. Art is drawn in order of its bottom edge: what is
lower on the map is in front.
