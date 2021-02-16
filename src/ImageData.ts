import {
  getDrawBlurFn,
  getDrawChangeBackgroundFn,
  getDrawMaskFn,
  drawImageData,
  SegmentationConfig,
} from './BodyPix'
import { CanvasElement, ImageType, Color } from './types'

type ArgsCreateImageData<T = Record<string, unknown>> = {
  src: ImageType
  config?: SegmentationConfig
  options?: T
}

export type ArgsCreateMaskedImageData = ArgsCreateImageData<{
  color?: Color
  maskOpacity?: number
  maskBlurAmount?: number
  flipHorizontal?: boolean
}>
export async function createMaskedImageData({
  src,
  options = {},
  config,
}: ArgsCreateMaskedImageData): Promise<ImageData> {
  const canvas = document.createElement('canvas') as CanvasElement
  await drawImageData({
    src,
    draw: getDrawMaskFn({ canvas, src, ...options }),
    config,
  })
  const ctx = canvas.getContext('2d')!
  return ctx.getImageData(0, 0, src.width, src.height)
}

export type ArgsChangedBackgroundImageData = ArgsCreateImageData<{
  maskOpacity?: number
  maskBlurAmount?: number
  flipHorizontal?: boolean
}> & { backgroundImage: HTMLImageElement | HTMLCanvasElement | ImageData }
export async function createChangedBackgroundImageData({
  src,
  backgroundImage,
  options = {},
  config,
}: ArgsChangedBackgroundImageData): Promise<ImageData> {
  const canvas = document.createElement('canvas') as CanvasElement
  await drawImageData({
    src,
    draw: getDrawChangeBackgroundFn({ src, canvas, backgroundImage, options }),
    config,
  })
  const ctx = canvas.getContext('2d')!
  return ctx.getImageData(0, 0, src.width, src.height)
}

export type ArgsCreateBluredImageData = ArgsCreateImageData<{
  backgroundBlurAmount?: number
  edgeBlurAmount?: number
  flipHorizontal?: boolean
}>
export async function createBluredImageData({
  src,
  options = {},
  config,
}: ArgsCreateBluredImageData): Promise<ImageData> {
  const canvas = document.createElement('canvas') as CanvasElement
  await drawImageData({
    src,
    draw: getDrawBlurFn({ src, canvas, options }),
    config,
  })
  const ctx = canvas.getContext('2d')!
  return ctx.getImageData(0, 0, src.width, src.height)
}
