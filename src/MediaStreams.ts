import {
  SemanticPersonSegmentation,
  PersonSegmentation,
  drawMask,
  drawBokehEffect,
} from '@tensorflow-models/body-pix'
import { InferenceConfig } from '@tensorflow-models/body-pix/dist/body_pix_model'
import { get, getDrawMaskFn, getDrawChangeBackgroundFn } from './BodyPix'
type Color = {
  r: number
  g: number
  b: number
  a: number
}

type CreateStreamArgs<T = {}> = {
  src: HTMLVideoElement
  frameRate?: number
  config?: InferenceConfig
  options?: T
}

interface CanvasElement extends HTMLCanvasElement {
  captureStream(frameRate?: number): MediaStream
}

export function createMaskedStream({ src, frameRate, options = {} }: CreateStreamArgs<{
  color?: Color,
  maskOpacity?: number,
  maskBlurAmount?: number,
  flipHorizontal?: boolean
}>) {
  const canvas = document.createElement('canvas') as CanvasElement
  return createStream(src, canvas, getDrawMaskFn({ canvas, src, ...options }), frameRate)
}

export function createChangedBackgroundStream({ src, frameRate, backgroundImage, options = {} }: CreateStreamArgs<{
  maskOpacity?: number,
  maskBlurAmount?: number,
  flipHorizontal?: boolean
}> & { backgroundImage: HTMLImageElement | HTMLCanvasElement | ImageData }) {
  const canvas = document.createElement('canvas') as CanvasElement
  return createStream(src, canvas, getDrawChangeBackgroundFn({ src, canvas, backgroundImage, options }), frameRate)
}

export function createBluredStream({ src, frameRate, options = {} }: CreateStreamArgs<{
     backgroundBlurAmount?: number,
     edgeBlurAmount?: number,
     flipHorizontal?: boolean
}>) {
  const canvas = document.createElement('canvas') as CanvasElement
  const draw = (segmentation: SemanticPersonSegmentation) => {
    drawBokehEffect(
      canvas,
      src,
      segmentation,
      options.backgroundBlurAmount ?? 9,
      options.edgeBlurAmount ?? 9,
      options.flipHorizontal
    )
  }
  return createStream(src, canvas, draw, frameRate)
}

function createStream(
  src: HTMLVideoElement,
  canvas: CanvasElement,
  draw: (segmentation: SemanticPersonSegmentation) => void,
  frameRate?: number
) {
  const stream = canvas.captureStream(frameRate ?? 30)
  let animationId = -1
  const loop = (() => {
    updateStream(src, draw)
    animationId = requestAnimationFrame(loop)
  })
  animationId = requestAnimationFrame(loop)
  src.onpause = () => {
    cancelAnimationFrame(animationId)
  }
  return stream
}

async function updateStream(
   src: HTMLVideoElement,
   draw: (segmentation: SemanticPersonSegmentation) => void
) {
  const net = get()
  const segmentation = await net.segmentPerson(src, { maxDetections: 1 })
  draw(segmentation)
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