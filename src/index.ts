import * as bodyPix from '@tensorflow-models/body-pix';
import '@tensorflow/tfjs';
import { createLoopVariable } from 'typescript';

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
  private async updateStream(src: HTMLVideoElement) {
    const segmentation = await this.net!.segmentPerson(src)
    const fgColor = { r: 0, g: 0, b: 0, a: 0 };
    const bgColor = { r: 127, g: 127, b: 127, a: 255 };
    const mask = bodyPix.toMask(segmentation, fgColor, bgColor)
    bodyPix.drawMask(this.canvas, src, mask, 1.0, 3)
  }
}

 
