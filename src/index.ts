import {
  BodyPix,
  SemanticPersonSegmentation,
  PersonSegmentation,
  load,
  toMask,
  drawMask,
  drawBokehEffect
} from '@tensorflow-models/body-pix'
import { ModelConfig, InferenceConfig } from '@tensorflow-models/body-pix/dist/body_pix_model'
import '@tensorflow/tfjs'

interface CanvasElement extends HTMLCanvasElement {
  captureStream(frameRate?: number): MediaStream
}
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
export class SegmentationVideo {
  private net: BodyPix | null = null
  private canvas: CanvasElement
  constructor() {
    this.canvas = document.createElement('canvas') as CanvasElement
  }
  async loadModel(modelConfig?: ModelConfig) {
    this.net = await load(modelConfig)
  }

  createMaskedStream({ src, frameRate, options = {} }: CreateStreamArgs<{
    color?: Color,
    maskOpacity?: number,
    maskBlurAmount?: number,
    flipHorizontal?: boolean
  }>) {
    const forground = { r: 0, g: 0, b: 0, a: 0 }
    const { color, ...drawOptions } = options
    const background = options?.color ? options.color : { r: 0, g: 0, b: 0, a: 255 }
    const draw = (segmentation: SemanticPersonSegmentation) => {
      const mask = toMask(segmentation, forground, background)
      drawMask(this.canvas, src, mask, drawOptions.maskOpacity || 1, drawOptions.maskBlurAmount, drawOptions.flipHorizontal)
    }
    return this.createStream(src, draw, frameRate)
  }

  createChangedBackgroundStream({ src, frameRate, backgroundImage, options = {} }: CreateStreamArgs<{
    maskOpacity?: number,
    maskBlurAmount?: number,
    flipHorizontal?: boolean
  }> & { backgroundImage: ImageData }) {
    const drawOptions = options
    const draw = (segmentation: SemanticPersonSegmentation) => {
      const mask = this.transparentPersonSegmentation(backgroundImage, segmentation)
      drawMask(this.canvas, src, mask, drawOptions.maskOpacity || 1, drawOptions.maskBlurAmount, drawOptions.flipHorizontal)
    }
    return this.createStream(src, draw, frameRate)
  }

  createBluredStream({ src, frameRate, options = {} }: CreateStreamArgs<{
     backgroundBlurAmount?: number,
     edgeBlurAmount?: number,
     flipHorizontal?: boolean
  }>) {
    const draw = (segmentation: SemanticPersonSegmentation) => {
      drawBokehEffect(
        this.canvas,
        src,
        segmentation,
        options.backgroundBlurAmount ?? 9,
        options.edgeBlurAmount ?? 9,
        options.flipHorizontal
      )
    }
    return this.createStream(src, draw, frameRate)
  }

  private createStream(
    src: HTMLVideoElement,
    draw: (segmentation: SemanticPersonSegmentation) => void,
    frameRate?: number
  ) {
    const stream = this.canvas.captureStream(frameRate ?? 30)
    let animationId = -1
    const loop = (() => {
      this.updateStream(src, draw)
      animationId = requestAnimationFrame(loop)
    })
    animationId = requestAnimationFrame(loop)
    src.onpause = () => {
      cancelAnimationFrame(animationId)
    }
    return stream
  }

  private async updateStream(
    src: HTMLVideoElement,
    draw: (segmentation: SemanticPersonSegmentation) => void
  ) {
    const segmentation = await this.net!.segmentPerson(src, { maxDetections: 1 })
    if (draw) {
      draw(segmentation)
    }
  }

  private transparentPersonSegmentation(imageData: ImageData, segmentation: SemanticPersonSegmentation) {
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
}

 
