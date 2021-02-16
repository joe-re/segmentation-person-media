import {
  drawImageData,
  getDrawMaskFn,
  getDrawChangeBackgroundFn,
  getDrawBlurFn,
  DrawFunction,
  SegmentationConfig,
} from './BodyPix'
import { CanvasElement, Color } from './types'

type CreateStreamArgs<T = Record<string, unknown>> = {
  src: HTMLVideoElement
  frameRate?: number
  options?: T
  config?: SegmentationConfig
}

export type ArgsCreateMaskedStrem = CreateStreamArgs<{
  color?: Color
  maskOpacity?: number
  maskBlurAmount?: number
  flipHorizontal?: boolean
}>
export function createMaskedStream({
  src,
  frameRate,
  options = {},
  config,
}: ArgsCreateMaskedStrem): MediaStream {
  const canvas = document.createElement('canvas') as CanvasElement
  return createStream(
    src,
    canvas,
    getDrawMaskFn({ canvas, src, ...options }),
    frameRate,
    config
  )
}

export type ArgsChangedBackgroundStream = CreateStreamArgs<{
  maskOpacity?: number
  maskBlurAmount?: number
  flipHorizontal?: boolean
}> & { backgroundImage: HTMLImageElement | HTMLCanvasElement | ImageData }
export function createChangedBackgroundStream({
  src,
  frameRate,
  backgroundImage,
  options = {},
  config,
}: ArgsChangedBackgroundStream): MediaStream {
  const canvas = document.createElement('canvas') as CanvasElement
  return createStream(
    src,
    canvas,
    getDrawChangeBackgroundFn({ src, canvas, backgroundImage, options }),
    frameRate,
    config
  )
}

export type ArgsCreateBluredStream = CreateStreamArgs<{
  backgroundBlurAmount?: number
  edgeBlurAmount?: number
  flipHorizontal?: boolean
}>
export function createBluredStream({
  src,
  frameRate,
  options = {},
  config,
}: ArgsCreateBluredStream): MediaStream {
  const canvas = document.createElement('canvas') as CanvasElement
  return createStream(
    src,
    canvas,
    getDrawBlurFn({ canvas, src, options }),
    frameRate,
    config
  )
}

function createStream(
  src: HTMLVideoElement,
  canvas: CanvasElement,
  draw: DrawFunction,
  frameRate?: number,
  config?: SegmentationConfig
) {
  const stream = canvas.captureStream(frameRate ?? 30)
  let animationId = -1
  const loop = () => {
    drawImageData({ src, draw, config })
    animationId = requestAnimationFrame(loop)
  }
  animationId = requestAnimationFrame(loop)
  src.onpause = () => {
    cancelAnimationFrame(animationId)
  }
  return stream
}
