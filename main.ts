import { load } from './src/index'

const startVideoButton = document.getElementById('start-video-button') as HTMLButtonElement
const pauseVideoButton = document.getElementById('pause-video-button') as HTMLButtonElement
const localVideo = document.getElementById('local-video') as HTMLVideoElement
const maskedVideo = document.getElementById('masked-video') as HTMLVideoElement
const img = document.getElementById('image') as HTMLImageElement
const selectionMask = document.getElementById('selection-mask') as HTMLInputElement
const selectionChangeBackGround = document.getElementById('selection-change-background') as HTMLInputElement
const selectionBlur = document.getElementById('selection-blur') as HTMLInputElement

let selection: 'mask' | 'change-background' | 'blur' = 'mask'

export async function startVideo() {
  const mediaConstraints = { video: { width: 640, height: 480 }, audio: false };

  const localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints).catch(err => {
    console.error("failed to get user media:", err);
    return
  }) as MediaStream

  localVideo.srcObject = localStream;
  await localVideo.play().catch(err => console.error('failed to play local video:', err))
  localVideo.volume = 0
  const segmentationMedia = await load()

  let stream: MediaStream;
  if (selection === 'mask') {
    stream = segmentationMedia.createMaskedStream({ src: localVideo })
  } else if (selection === 'change-background') {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(img, 0, 0)
    const imageData = ctx.getImageData(0, 0, img.width, img.height)
    stream = segmentationMedia.createChangedBackgroundStream({ src: localVideo, backgroundImage: imageData })
  } else {
    stream = segmentationMedia.createBluredStream({ src: localVideo })
  }
  maskedVideo.srcObject = stream
  maskedVideo.play()
}

export async function pauseVideo() {
  localVideo.pause()
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
selectionBlur.onclick = function () {
  selection = 'blur'
}
