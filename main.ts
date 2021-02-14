import { load } from './src/index'

const srcSelectionCamera = document.getElementById('src-selection-camera') as HTMLInputElement
const srcSelectionImageData = document.getElementById('src-selection-image-data') as HTMLInputElement
const srcCamera = document.getElementById('src-camera') as HTMLInputElement
const srcImageData = document.getElementById('src-image-data') as HTMLInputElement
const localVideo = document.getElementById('local-video') as HTMLVideoElement
const maskedVideo = document.getElementById('masked-video') as HTMLVideoElement
const selectionMask = document.getElementById('selection-mask') as HTMLInputElement
const colorPicker = document.getElementById('color-picker') as HTMLInputElement
const selectionChangeBackGround = document.getElementById('selection-change-background') as HTMLInputElement
const selectionBlur = document.getElementById('selection-blur') as HTMLInputElement
const backgroundImages = document.getElementsByClassName('for-change-background-option-image') as HTMLCollectionOf<HTMLImageElement>
const maskOption = document.getElementById('for-mask-option')
const changeBackgroundOption = document.getElementById('for-change-background-option')
const personImage = document.getElementById('person-image') as HTMLImageElement
const maskedPersonImage = document.getElementById('masked-person-image') as HTMLCanvasElement

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

function getSelectedBackgroundImage(src: HTMLVideoElement | HTMLImageElement) {
  const canvas = document.createElement('canvas')
  canvas.width = src.width
  canvas.height = src.height
  const img: HTMLImageElement = Array.prototype.find.call(backgroundImages, (image) => {
    return image.className.includes('selected')
  })
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, src.width, src.height)
  const imageData = ctx.getImageData(0, 0, src.width, src.height)
  return imageData
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
      const imageData = getSelectedBackgroundImage(localVideo)
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

function changeEffect() {
  if (srcSelection === 'camera') {
    playVideo()
  } else {
    segmentPersonImage()
  }
}

selectionMask.onclick = function() {
  selection = 'mask'
  changeOptionVisibility()
  changeEffect()
}
selectionChangeBackGround.onclick = function () {
  selection = 'change-background'
  changeOptionVisibility()
  changeEffect()
}
selectionBlur.onclick = function () {
  selection = 'blur'
  changeOptionVisibility()
  changeEffect()
}

colorPicker.onchange = function () {
  changeEffect()
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
    changeEffect()
  }
}

async function segmentPersonImage() {
  const segmentationMedia = await load()
  let maskedImageData: ImageData | null = null
  if (selection === 'mask') {
    const color = hexToRgb(colorPicker.value)
    maskedImageData = await segmentationMedia.createMaskedImageData({ src: personImage, options: { color }})
  } else if (selection === 'change-background') {
    const imageData = getSelectedBackgroundImage(personImage)
    maskedImageData = await segmentationMedia.createChangedBackgroundImageData({
      src: personImage, backgroundImage: imageData
    })
  }
  if (!maskedImageData) {
    throw new Error('failed to create maskedImageData')
  }
  maskedPersonImage.width = maskedImageData.width
  maskedPersonImage.height = maskedImageData.height
  const maskedCtx = maskedPersonImage.getContext('2d')
  maskedCtx!.putImageData(maskedImageData, 0, 0)
}

let srcSelection: 'camera' | 'image-data' = 'camera'
srcSelectionCamera.onclick = () => {
  srcSelection = 'camera'
  srcCamera.style.display = 'block'
  srcImageData.style.display = 'none' 
}

srcSelectionImageData.onclick = () => {
  srcSelection = 'image-data'
  srcCamera.style.display = 'none'
  srcImageData.style.display = 'block' 
  segmentPersonImage()
}