export interface CanvasElement extends HTMLCanvasElement {
  captureStream(frameRate?: number): MediaStream
}
export type ImageType = HTMLImageElement | HTMLVideoElement | HTMLCanvasElement;
export type Color = {
  r: number
  g: number
  b: number
  a: number
}