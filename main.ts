import { load } from './src/index'

const localVideo = document.getElementById('local-video') as HTMLVideoElement
const maskedVideo = document.getElementById('masked-video') as HTMLVideoElement
const selectionMask = document.getElementById('selection-mask') as HTMLInputElement
const colorPicker = document.getElementById('color-picker') as HTMLInputElement
const selectionChangeBackGround = document.getElementById('selection-change-background') as HTMLInputElement
const selectionBlur = document.getElementById('selection-blur') as HTMLInputElement
const backgroundImages = document.getElementsByClassName('for-change-background-option-image') as HTMLCollectionOf<HTMLImageElement>
const maskOption = document.getElementById('for-mask-option')
const changeBackgroundOption = document.getElementById('for-change-background-option')

let selection: 'mask' | 'change-background' | 'blur' = 'mask'

let initialized = false

function hexToRgb(hex: string) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return {
    r: parseInt(result![1], 16),
    g: parseInt(result![2], 16),
    b: parseInt(result![3], 16),
    a: 255
  }
}

function getSelectedBackgroundImage() {
  return Array.prototype.find.call(backgroundImages, (image) => {
    return image.className.includes('selected')
  })
}

async function startVideo() {
  if (initialized) {
    playVideo()
    return
  }
  const segmentationMedia = await load()
  const mediaConstraints = { video: { width: 640, height: 480 }, audio: false };

  const localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints).catch(err => {
    console.error("failed to get user media:", err);
    return
  }) as MediaStream

  localVideo.srcObject = localStream;
  localVideo.volume = 0
  localVideo.onloadeddata = () => {
    localVideo.play().catch(err => console.error('failed to play local video:', err))
  }

  localVideo.onplay = () => {
    let stream: MediaStream;
    if (selection === 'mask') {
      const color = hexToRgb(colorPicker.value)
      stream = segmentationMedia.createMaskedStream({ src: localVideo, options: { color } })
    } else if (selection === 'change-background') {
      const canvas = document.createElement('canvas')
      canvas.width = localVideo.width
      canvas.height = localVideo.height
      const ctx = canvas.getContext('2d')!
      const img = getSelectedBackgroundImage()
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, localVideo.width, localVideo.height)
      stream = segmentationMedia.createChangedBackgroundStream({ src: localVideo, backgroundImage: imageData })
    } else {
      stream = segmentationMedia.createBluredStream({ src: localVideo })
    }
    maskedVideo.srcObject = stream
    maskedVideo.play()
  }
  initialized = true
}

function playVideo() {
  if (!localVideo.paused) {
    pauseVideo()
  }
  localVideo.play().catch(err => console.error('failed to play local video:', err))
}

async function pauseVideo() {
  localVideo.pause()
}

startVideo()

function changeOptionVisibility() {
  maskOption!.style.display = 'none'
  changeBackgroundOption!.style.display = 'none' 
  if (selection === 'mask') {
    maskOption!.style.display = 'block'
  }
  if (selection === 'change-background') {
    changeBackgroundOption!.style.display = 'block' 
  }
}

selectionMask.onclick = function() {
  selection = 'mask'
  changeOptionVisibility()
  playVideo()
}
selectionChangeBackGround.onclick = function () {
  selection = 'change-background'
  changeOptionVisibility()
  playVideo()
}
selectionBlur.onclick = function () {
  selection = 'blur'
  changeOptionVisibility()
  playVideo()
}

colorPicker.onchange = function () {
  playVideo()
}

function offAllBackgroundImageSelection () {
  for (const img of backgroundImages) {
    img.classList.remove('selected')
  }
}

for (const img of backgroundImages) {
  img.onclick = () => {
    offAllBackgroundImageSelection()
    img.classList.add('selected')
    playVideo()
  }
}