import { SegmentationVideo } from './src/index'

const startVideoButton = document.getElementById('start_video_button') as HTMLButtonElement
const localVideo = document.getElementById('local_video') as HTMLVideoElement
const maskedVideo = document.getElementById('masked_video') as HTMLVideoElement
const img = document.getElementById('image') as HTMLImageElement
export async function startVideo() {
  const mediaConstraints = { video: { width: 640, height: 480 }, audio: false };

  const localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints).catch(err => {
    console.error('media ERROR:', err);
    return;
  }) as MediaStream;

  localVideo.srcObject = localStream;
  await localVideo.play().catch(err => console.error('local play ERROR:', err));
  localVideo.volume = 0;

  startMaskedVideo();
  // const context = canvas.getContext('2d')
  // setTimeout(async () => {
  //   await segmentPerson(localVideo, canvas)
  // }, 2000)
}
async function startMaskedVideo() {
  const segmentationVideo = new SegmentationVideo()
  await segmentationVideo.init()
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, img.width, img.height)
  // const stream = segmentationVideo.createMaskedStream(localVideo)
  const stream = segmentationVideo.createChangedBackgroundStream(localVideo, imageData)
  maskedVideo.srcObject = stream
  maskedVideo.play()
}
startVideoButton.onclick = function() {
  startVideo()
}
