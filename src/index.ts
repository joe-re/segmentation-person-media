import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs';

interface CanvasElement extends HTMLCanvasElement {
  captureStream(frameRate?: number): MediaStream;
}

export class SegmentationVideo {
  private net: bodyPix.BodyPix | null = null
  private canvas: CanvasElement
  constructor() {
    this.canvas = document.createElement('canvas') as CanvasElement
  }
  async init() {
    this.net = await bodyPix.load()
  }

  createMaskedStream(src: HTMLVideoElement) {
    const fgColor = { r: 0, g: 0, b: 0, a: 0 }
    const bgColor = { r: 127, g: 127, b: 127, a: 255 }
    const draw = (segmentation: bodyPix.SemanticPersonSegmentation) => {
      const mask = bodyPix.toMask(segmentation, fgColor, bgColor)
      bodyPix.drawMask(this.canvas, src, mask, 1)
    }
    return this.createStream(src, draw)
  }

  createChangedBackgroundStream(src: HTMLVideoElement, imageData: ImageData) {
    const draw = (segmentation: bodyPix.SemanticPersonSegmentation) => {
      const mask = this.transparentPersonSegmentation(imageData, segmentation)
      bodyPix.drawMask(this.canvas, src, mask, 1)
    }
    return this.createStream(src, draw)
  }

  createBluredStream(src: HTMLVideoElement) {
    const draw = (segmentation: bodyPix.SemanticPersonSegmentation) => {
      bodyPix.drawBokehEffect(this.canvas, src, segmentation, 9, 9)
    }
    return this.createStream(src, draw)
  }

  private createStream(
    src: HTMLVideoElement,
    draw?: (segmentation: bodyPix.SemanticPersonSegmentation) => void
  ) {
    const stream = this.canvas.captureStream(30)
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
    draw?: (segmentation: bodyPix.SemanticPersonSegmentation) => void
  ) {
    const segmentation = await this.net!.segmentPerson(src, { maxDetections: 1 })
    if (draw) {
      draw(segmentation)
    }
  }

  private transparentPersonSegmentation(imageData: ImageData, segmentation: bodyPix.SemanticPersonSegmentation) {
    let multiPersonSegmentation: Array<
      bodyPix.SemanticPersonSegmentation |
      bodyPix.PersonSegmentation
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

 
