import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs';

interface CanvasElement extends HTMLCanvasElement {
  captureStream(frameRate?: number): MediaStream;
}

export async function segmentPerson(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
  // load the BodyPix model from a checkpoint
  const net = await bodyPix.load();
  const segmentation = await net.segmentPerson(video)
  const fgColor = { r: 0, g: 0, b: 0, a: 0 };
  const bgColor = { r: 127, g: 127, b: 127, a: 255 };
  const mask = bodyPix.toMask(segmentation, fgColor, bgColor)
  bodyPix.drawMask(canvas, video, mask, 1.0, 3)
}

let net: bodyPix.BodyPix
export async function create() {
  net = await bodyPix.load()
  return segmentPerson
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
    const stream = this.canvas.captureStream(30)
    const loop = (() => {
      this.updateStream(src)
      requestAnimationFrame(loop)
    })
    requestAnimationFrame(loop)
    return stream
  }
  private async updateStream(src: HTMLVideoElement, imageData?: ImageData) {
    const segmentation = await this.net!.segmentPerson(src, { maxDetections: 1 })
    const fgColor = { r: 0, g: 0, b: 0, a: 0 }
    const bgColor = { r: 127, g: 127, b: 127, a: 255 }
    if (!imageData) {
      const mask = bodyPix.toMask(segmentation, fgColor, bgColor)
      bodyPix.drawMask(this.canvas, src, mask, 1)
    } else {
      const mask = this.transparent(imageData, segmentation)
      bodyPix.drawMask(this.canvas, src, mask, 1)
    }
  }

  createChangedBackgroundStream(src: HTMLVideoElement, imageData: ImageData) {
    const stream = this.canvas.captureStream(30)
    const loop = (() => {
      this.updateStream(src, imageData)
      requestAnimationFrame(loop)
    })
    requestAnimationFrame(loop)
    return stream
  }

  private transparent(imageData: ImageData, segmentation: bodyPix.SemanticPersonSegmentation) {
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

 
