import * as bodyPix from '@tensorflow-models/body-pix';
 
// const outputStride = 16;
// const segmentationThreshold = 0.5;
 
const imageElement = document.getElementById('image');

async function segmentPerson() {
  // load the BodyPix model from a checkpoint
  const net = await bodyPix.load();
  const segmentation = await net.segmentPerson(imageElement)
   
  console.log(segmentation);
}
 
