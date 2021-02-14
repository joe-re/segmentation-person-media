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
  backgroundImage: HTMLImageElement | HTMLCanvasElement | ImageData,
  options?: MaskOptions
}) {
  const draw = (segmentation: SemanticPersonSegmentation) => {
    let backgroundImageData: ImageData
    if (backgroundImage instanceof HTMLElement) {
      const _canvas = resizeImageToFitElementSize(backgroundImage, { width: src.width, height: src.height })
      const ctx = _canvas.getContext('2d')!
      backgroundImageData = ctx.getImageData(0, 0, src.width, src.height)
    } else {
      backgroundImageData = backgroundImage
    }
    const mask = transparentPersonSegmentation(backgroundImageData, segmentation)
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

function resizeImageToFitElementSize(src: ImageType, size?: { width: number, height: number }) {
  if (src instanceof HTMLCanvasElement) {
    return src
  }
  const canvas = document.createElement('canvas')
  const naturalSize = getNatualSize(src)
  const { width, height } = size ? size : src
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(src, 0, 0, naturalSize.width, naturalSize.height, 0, 0, width, height)
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