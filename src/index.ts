import { ModelConfig } from '@tensorflow-models/body-pix/dist/body_pix_model'
import '@tensorflow/tfjs'
import { createMaskedStream, createBluredStream, createChangedBackgroundStream } from './MediaStreams'
import { createMaskedImageData, createChangedBackgroundImageData, createBluredImageData } from './ImageData'
import { loadModel } from './BodyPix'

export async function load(modelConfig?: ModelConfig) {
  await loadModel(modelConfig)
  return {
    createMaskedStream,
    createChangedBackgroundStream,
    createBluredStream,
    createMaskedImageData,
    createChangedBackgroundImageData,
    createBluredImageData
  }
}
