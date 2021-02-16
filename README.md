# Segmentation Person Media

Person segmentation from a media element and manipulate background in the browser.

<img src="https://user-images.githubusercontent.com/4954534/108002062-b22e0180-7031-11eb-8e6c-9625074321aa.gif" width=300px>

## [Try it out by live demo heer!](https://joe-re.github.io/segmentation-person-media/)

To segment person, it's using [BodyPix](https://github.com/tensorflow/tfjs-models/tree/master/body-pix) from tensor-flow project.

## Installing

```
npm install segmentation-person-media
```

## Usage

```ts
import { load } from 'segment-person-media'
const segmentationPersonMedia = await load()

// 1. Create a MediaStream from HTMLVidelElement
const localVideo = document.getElementById('local-video') as HTMLVideoElement
// 1.1 Mask
const maskedStream = segmentationMedia.createMaskedStream({ src: localVideo } })
// 1.2 Change background
const imageData = getSelectedBackgroundImage()
const changedBackGroundStream = segmentationMedia.createChangedBackgroundStream({ src: localVideo, backgroundImage: imageData })
// 1.3 Blur
const bluredStream = segmentationMedia.createBluredStream({ src: localVideo })

// 2. Create a ImageData from HTMLImageElement
const personImage = document.getElementById('person-image') as HTMLImageElement
// 2.1 Mask
const maskedImageData = await segmentationMedia.createMaskedImageData({ src: personImage })
// 2.2 Change background
const imageData = getSelectedBackgroundImage()
const changedBackGroundImageData = await segmentationMedia.createChangedBackgroundImageData({
  src: personImage, backgroundImage: imageData
})
// 2.3 Blur
const bluredImageData = await segmentationMedia.createBluredImageData({
  src: personImage
})
```

You can check demo code lines to get to know details of how to use.

https://github.com/joe-re/segmentation-person-media/blob/main/demo/main.ts


## Loading the model

You need to the model data to segment person at first.

```ts
const segmentationPersonMedia = await load()
```

SegmentPersonMedia accepts the same arguments as BodyPix and you can adjust it for your project.

ref: https://github.com/tensorflow/tfjs-models/tree/master/body-pix#loading-the-model

## APIs

### Requirements

For creating a stream APIs, it requires `canvas.captureStream` for the browser.
https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/captureStream

### Common params

- `SegmentationConfig` is the same as `segmentPerson`'s config from BodyPix.
https://github.com/tensorflow/tfjs-models/tree/master/body-pix#person-segmentation

### createMaskedStream

Create a masked background stream from HTMLVideoElement.

```ts
const stream = segmentationMedia.createMaskedStream({ src: localVideo } }
```

#### input

```ts
{
  src: HTMLVideoElement,
  frameRate?: number,        // default: 30
  options?: {
    color?: {                // default: { r: 255, g: 255, b: 255, a: 255 }
      r: number,
      g: number,
      b: number,
      a: number
    },
    maskOpacity?: number,    // default: 1
    maskBlurAmount?: number, // default: 0
    flipHorizontal?: boolean // default: false
  },
  config?: SegmentationConfig
}
```

Options includes some parameters to give `drawPix.drawMask`.
https://github.com/tensorflow/tfjs-models/tree/master/body-pix#bodypixdrawmask

#### returns

MediaStream


### createChangedBackgroundStream

Create a changed background stream from HTMLVideoElement.

```ts
const stream = segmentationMedia.createChangedBackgroundStream({ src: localVideo, backgroundImage: imageData })
```

#### input

```ts
{
  src: HTMLVideoElement,
  frameRate?: number,         // default: 30
  backgroundImage: HTMLImageElement | HTMLCanvasElement | ImageData,
  options?: {
    maskOpacity?: number,     // default: 1
    maskBlurAmount?: number,  // default: 0
    flipHorizontal?: boolean  // default: false
  },
  config?: SegmentationConfig
}
```

Options includes some parameters to give `drawPix.drawMask`.
https://github.com/tensorflow/tfjs-models/tree/master/body-pix#bodypixdrawmask

#### returns

MediaStream

### createBluredStream

Create a blured background stream from HTMLVideoElement.

```ts
const stream = segmentationMedia.createBluredStream({ src: localVideo })
```

#### input

```ts
{
  src: HTMLVideoElement,
  frameRate?: number,              // default: 30
  options?: {
    backgroundBlurAmount?: number, // default: 9
    edgeBlurAmount?: number,       // default: 9
    flipHorizontal?: boolean       // default: false
  },
  config?: SegmentationConfig
}
```

Options includes some parameters to give `drawPix.drawBokehEffect`.
https://github.com/tensorflow/tfjs-models/tree/master/body-pix#inputs-4

#### returns

MediaStream

### createMaskedImageData

Create a masked background image data from MediaElement.

```ts
const imageData = segmentationMedia.createMaskedImageData({ src: personImage })
```

#### input

```ts
{
  src: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  options?: {
    color?: {                // default: { r: 255, g: 255, b: 255, a: 255 }
      r: number,
      g: number,
      b: number,
      a: number
    },
    maskOpacity?: number,    // default: 1
    maskBlurAmount?: number, // default: 0
    flipHorizontal?: boolean // default: false
  },
  config?: SegmentationConfig
}
```

Options includes some parameters to give `drawPix.drawMask`.
https://github.com/tensorflow/tfjs-models/tree/master/body-pix#bodypixdrawmask


#### returns

ImageData

### createChangedBackgroundImageData

Create a masked background image data from MediaElement.

```ts
const imageData = await segmentationMedia.createChangedBackgroundImageData({
  src: personImage, backgroundImage: imageData
})
```

#### input
```ts
{
  src: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement,
  backgroundImage: HTMLImageElement | HTMLCanvasElement | ImageData,
  options?: {
    maskOpacity?: number,     // default: 1
    maskBlurAmount?: number,  // default: 0
    flipHorizontal?: boolean  // default: false
  },
  config?: SegmentationConfig
}
```

Options includes some parameters to give `drawPix.drawMask`.
https://github.com/tensorflow/tfjs-models/tree/master/body-pix#bodypixdrawmask

#### returns

MediaStream

### createBluredImageData

Create a blured background image data from MediaElement.

```ts
const imageData = await segmentationMedia.createBluredImageData({
  src: personImage
})
```


#### input

```ts
{
  src: HTMLVideoElement,
  options?: {
    backgroundBlurAmount?: number, // default: 9
    edgeBlurAmount?: number,       // default: 9
    flipHorizontal?: boolean       // default: false
  },
  config?: SegmentationConfig
}
```

Options includes some parameters to give `drawPix.drawBokehEffect`.
https://github.com/tensorflow/tfjs-models/tree/master/body-pix#inputs-4
