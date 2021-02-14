import {
  SemanticPersonSegmentation,
  PersonSegmentation,
} from '@tensorflow-models/body-pix'
import { InferenceConfig } from '@tensorflow-models/body-pix/dist/body_pix_model'
import { get, getDrawMaskFn, getDrawChangeBackgroundFn, getDrawBlurFn } from './BodyPix'
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
  return createStream(src, canvas, getDrawBlurFn({ canvas, src, options }), frameRate)
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
