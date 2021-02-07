import * as bodyPix from '@tensorflow-models/body-pix';
import * as tf from '@tensorflow/tfjs';
// const outputStride = 16;
// const segmentationThreshold = 0.5;
 
export async function segmentPerson(video: HTMLVideoElement) {
  console.log('Using TensorFlow backend: ', tf.getBackend());
  // load the BodyPix model from a checkpoint
  const net = await bodyPix.load();
  const segmentation = await net.segmentPerson(video)
   
  console.log(segmentation);
}
 
