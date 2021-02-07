import * as bodyPix from '@tensorflow-models/body-pix';
import * as tf from '@tensorflow/tfjs';
// const outputStride = 16;
// const segmentationThreshold = 0.5;
 
export async function segmentPerson(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
  console.log('Using TensorFlow backend: ', tf.getBackend());
  // load the BodyPix model from a checkpoint
  const net = await bodyPix.load();
  const segmentation = await net.segmentPerson(video)
  const fgColor = { r: 0, g: 0, b: 0, a: 0 };
  const bgColor = { r: 127, g: 127, b: 127, a: 255 };
  const mask = bodyPix.toMask(segmentation, fgColor, bgColor)
  bodyPix.drawMask(canvas, video, mask, 1.0, 3)
}
 
