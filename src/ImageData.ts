import {
  SemanticPersonSegmentation,
} from '@tensorflow-models/body-pix'
import { InferenceConfig } from '@tensorflow-models/body-pix/dist/body_pix_model'
import { get, getDrawMaskFn } from './BodyPix'
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
  await drawImageData(src, getDrawMaskFn({ canvas, src, ...options }))
  const ctx = canvas.getContext('2d')!
  return ctx.getImageData(0, 0, src.width, src.height)
}

async function drawImageData(
   src: ImageType,
   draw: (segmentation: SemanticPersonSegmentation) => void
) {
  const net = get()
  const segmentation = await net.segmentPerson(src, { maxDetections: 1 })
  draw(segmentation)
}
