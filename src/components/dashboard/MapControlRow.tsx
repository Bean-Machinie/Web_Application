type Props = {
  slider: React.ReactNode
  field: React.ReactNode
  // The three buttons after the number, then one after the divider.
  buttons: React.ReactNode
  aside: React.ReactNode
}

// One row of the navigator's controls, as cells of the grid it is in (see
// MapControlGrid), so that the rows have the same columns.
export function MapControlRow({ slider, field, buttons, aside }: Props) {
  return (
    <>
      {slider}
      {field}
      {buttons}
      {aside}
    </>
  )
}
