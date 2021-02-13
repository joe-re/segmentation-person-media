import { SegmentationVideo } from './src/index'

const startVideoButton = document.getElementById('start-video-button') as HTMLButtonElement
const pauseVideoButton = document.getElementById('pause-video-button') as HTMLButtonElement
const localVideo = document.getElementById('local-video') as HTMLVideoElement
const maskedVideo = document.getElementById('masked-video') as HTMLVideoElement
const img = document.getElementById('image') as HTMLImageElement
const selectionMask = document.getElementById('selection-mask') as HTMLInputElement
const selectionChangeBackGround = document.getElementById('selection-change-background') as HTMLInputElement

let selection: 'mask' | 'change-background' = 'mask'

export async function startVideo() {
  const mediaConstraints = { video: { width: 640, height: 480 }, audio: false };

  const localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints).catch(err => {
    console.error("failed to get user media:", err);
    return
  }) as MediaStream

  localVideo.srcObject = localStream;
  await localVideo.play().catch(err => console.error('failed to play local video:', err))
  localVideo.volume = 0

  if (selection === 'mask') {
    startMaskedVideo()
  } else {
    startChangedBackgroundVideo()
  }
}

export async function pauseVideo() {
  localVideo.pause()
}

async function startMaskedVideo() {
  const segmentationVideo = new SegmentationVideo()
  await segmentationVideo.init()
  const stream = segmentationVideo.createMaskedStream(localVideo)
  maskedVideo.srcObject = stream
  maskedVideo.play()
}

async function startChangedBackgroundVideo() {
  const segmentationVideo = new SegmentationVideo()
  await segmentationVideo.init()
  const canvas = document.createElement('canvas')
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  const imageData = ctx.getImageData(0, 0, img.width, img.height)
  const stream = segmentationVideo.createChangedBackgroundStream(localVideo, imageData)
  maskedVideo.srcObject = stream
  maskedVideo.play()
}

startVideoButton.onclick = function() {
  startVideo()
}

pauseVideoButton.onclick = function() {
  pauseVideo()
}

selectionMask.onclick = function() {
  selection = 'mask'
}
selectionChangeBackGround.onclick = function () {
  selection = 'change-background'
}