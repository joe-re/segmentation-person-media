import {
  SemanticPersonSegmentation,
  PersonSegmentation,
  toMask,
  drawMask,
  drawBokehEffect,
} from '@tensorflow-models/body-pix'
import { InferenceConfig } from '@tensorflow-models/body-pix/dist/body_pix_model'
import { inferFromImplicitShape } from '@tensorflow/tfjs-core/dist/util';
import { get } from './BodyPix'
type Color = {
  r: number
  g: number
  b: number
  a: number
}


declare type ImageType = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;
type CreateImageDataArgs<T = {}> = {
  src: ImageType
  config?: InferenceConfig
  options?: T
}

interface CanvasElement extends HTMLCanvasElement {
  captureStream(frameRate?: number): MediaStream
}


export async function createMaskedImageData({ src, options = {} }: CreateImageDataArgs<{
  color?: Color,
  maskOpacity?: number,
  maskBlurAmount?: number,
  flipHorizontal?: boolean
}>) {
  const canvas = document.createElement('canvas') as CanvasElement
  const ctx = canvas.getContext('2d')!
  const forground = { r: 0, g: 0, b: 0, a: 0 }
  const { color, ...drawOptions } = options
  const background = options?.color ? options.color : { r: 0, g: 0, b: 0, a: 255 }
  const draw = (segmentation: SemanticPersonSegmentation) => {
    const mask = toMask(segmentation, forground, background)
    drawMask(canvas, resizeToSrcSize(src), mask, drawOptions.maskOpacity || 1, drawOptions.maskBlurAmount, drawOptions.flipHorizontal)
  }
  await drawImageData(src, draw)
  return ctx.getImageData(0, 0, src.width, src.height)
}

function getNatualSize(src: ImageType) {
  if (src instanceof HTMLImageElement) {
    // When src is ImageElement, src should be resized to DOM size before drawing it
    return { width: src.naturalWidth, height: src.naturalHeight }
  }
  return { width: src.width, height: src.height }
}

function resizeToSrcSize(src: ImageType) {
  const canvas = document.createElement('canvas')
  const { width, height } = getNatualSize(src)
  canvas.width = src.width
  canvas.height = src.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(src, 0, 0, width, height, 0, 0, src.width, src.height)
  return canvas
}

async function drawImageData(
   src: ImageType,
   draw: (segmentation: SemanticPersonSegmentation) => void
) {
  const net = get()
  const segmentation = await net.segmentPerson(src, { maxDetections: 1 })
  draw(segmentation)
}
