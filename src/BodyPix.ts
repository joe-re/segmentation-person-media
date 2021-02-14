import { BodyPix, load, SemanticPersonSegmentation, PersonSegmentation, toMask, drawMask } from '@tensorflow-models/body-pix'
import { ModelConfig } from '@tensorflow-models/body-pix/dist/body_pix_model'

let net: BodyPix | null = null
interface CanvasElement extends HTMLCanvasElement {
  captureStream(frameRate?: number): MediaStream
}
type ImageType = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;
type Color = {
  r: number
  g: number
  b: number
  a: number
}

export async function loadModel(modelConfig?: ModelConfig) {
  net = await load(modelConfig)
}

export function get() {
  if (!net) {
    throw new Error('Modal data has not been downloaded yet.')
  }
  return net
}
type MaskOptions = {
  maskOpacity?: number,
  maskBlurAmount?: number,
  flipHorizontal?: boolean
}

export function getDrawMaskFn({
  canvas,
  src,
  color = { r: 0, g: 0, b: 0, a: 255 },
  options = {}
}: { canvas: CanvasElement, src: ImageType, color?: Color, options?: MaskOptions }) {
  const forground = { r: 0, g: 0, b: 0, a: 0 }
  const draw = (segmentation: SemanticPersonSegmentation) => {
    const mask = toMask(segmentation, forground, color)
    drawMask(canvas, resizeImageToFitElementSize(src), mask, options.maskOpacity || 1, options.maskBlurAmount, options.flipHorizontal)
  }
  return draw
}

export function getDrawChangeBackgroundFn({
  canvas,
  src,
  backgroundImage,
  options = {}
}: {
  canvas: CanvasElement,
  src: ImageType,
  backgroundImage: ImageData,
  options?: MaskOptions
}) {
  const draw = (segmentation: SemanticPersonSegmentation) => {
    const mask = transparentPersonSegmentation(backgroundImage, segmentation)
    drawMask(canvas, resizeImageToFitElementSize(src), mask, options.maskOpacity || 1, options.maskBlurAmount, options.flipHorizontal)
  }
  return draw
}

function getNatualSize(src: ImageType) {
  if (src instanceof HTMLImageElement) {
    return { width: src.naturalWidth, height: src.naturalHeight }
  }
  return { width: src.width, height: src.height }
}

function resizeImageToFitElementSize(src: ImageType) {
  if (src instanceof HTMLCanvasElement) {
    return src
  }
  const canvas = document.createElement('canvas')
  const { width, height } = getNatualSize(src)
  canvas.width = src.width
  canvas.height = src.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(src, 0, 0, width, height, 0, 0, src.width, src.height)
  return canvas
}

function transparentPersonSegmentation(imageData: ImageData, segmentation: SemanticPersonSegmentation) {
  let multiPersonSegmentation: Array<
    SemanticPersonSegmentation |
    PersonSegmentation
  >

  if (!Array.isArray(segmentation)) {
    multiPersonSegmentation = [segmentation];
  } else {
    multiPersonSegmentation = segmentation;
  }
  const tranparented = new Uint8ClampedArray(imageData.data)
  const { height, width } = segmentation
  for (let i = 0; i < height; i++) {
    for (let j = 0; j < width; j++) {
      const n = i * width + j
      for (let k = 0; k < multiPersonSegmentation.length; k++) {
        if (multiPersonSegmentation[k].data[n]) {
          tranparented[4 * n + 3] = 0
        }
      }
    }
  }
  return new ImageData(tranparented, width, height)
}