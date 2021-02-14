import { getDrawBlurFn, getDrawChangeBackgroundFn, getDrawMaskFn, drawImageData, SegmentationConfig } from './BodyPix'
import { CanvasElement, ImageType, Color } from './types'

type CreateImageDataArgs<T = {}> = {
  src: ImageType
  config?: SegmentationConfig
  options?: T
}

export async function createMaskedImageData({ src, options = {}, config }: CreateImageDataArgs<{
  color?: Color,
  maskOpacity?: number,
  maskBlurAmount?: number,
  flipHorizontal?: boolean
}>) {
  const canvas = document.createElement('canvas') as CanvasElement
  await drawImageData({
    src,
    draw: getDrawMaskFn({ canvas, src, ...options }), config
  })
  const ctx = canvas.getContext('2d')!
  return ctx.getImageData(0, 0, src.width, src.height)
}

export async function createChangedBackgroundImageData({ src, backgroundImage, options = {}, config }: CreateImageDataArgs<{
  maskOpacity?: number,
  maskBlurAmount?: number,
  flipHorizontal?: boolean
}> & { backgroundImage: HTMLImageElement | HTMLCanvasElement | ImageData }) {
  const canvas = document.createElement('canvas') as CanvasElement
  await drawImageData({
    src, draw: getDrawChangeBackgroundFn({ src, canvas, backgroundImage, options }), config
  })
  const ctx = canvas.getContext('2d')!
  return ctx.getImageData(0, 0, src.width, src.height)
}

export async function createBluredImageData({ src, options = {}, config }: CreateImageDataArgs<{
  backgroundBlurAmount?: number,
  edgeBlurAmount?: number,
  flipHorizontal?: boolean
}>) {
  const canvas = document.createElement('canvas') as CanvasElement
  await drawImageData({
    src,
    draw: getDrawBlurFn({ src, canvas, options }),
    config
  })
  const ctx = canvas.getContext('2d')!
  return ctx.getImageData(0, 0, src.width, src.height)
}
