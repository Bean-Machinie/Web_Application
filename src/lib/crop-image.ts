import type { Area } from "react-easy-crop"

const OUTPUT_SIZE = 512

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Could not read that image."))
    image.src = src
  })
}

// `area` is in the coordinates of the image after it has been rotated, which
// is what react-easy-crop reports.
export async function getCroppedFile(src: string, area: Area, rotation: number) {
  const image = await loadImage(src)
  const radians = (rotation * Math.PI) / 180
  const sin = Math.abs(Math.sin(radians))
  const cos = Math.abs(Math.cos(radians))

  const rotated = document.createElement("canvas")
  rotated.width = image.width * cos + image.height * sin
  rotated.height = image.width * sin + image.height * cos
  const rotatedContext = rotated.getContext("2d")!
  rotatedContext.translate(rotated.width / 2, rotated.height / 2)
  rotatedContext.rotate(radians)
  rotatedContext.drawImage(image, -image.width / 2, -image.height / 2)

  const output = document.createElement("canvas")
  output.width = OUTPUT_SIZE
  output.height = OUTPUT_SIZE
  output
    .getContext("2d")!
    .drawImage(rotated, area.x, area.y, area.width, area.height, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE)

  const blob = await new Promise<Blob | null>((resolve) =>
    output.toBlob(resolve, "image/png")
  )
  if (!blob) throw new Error("Could not crop that image.")

  return new File([blob], "avatar.png", { type: "image/png" })
}
