import '@tensorflow/tfjs'
import { ModelConfig } from '@tensorflow-models/body-pix/dist/body_pix_model'
import * as MediaStream from './MediaStream'
import * as ImageData from './ImageData'
import { loadModel } from './BodyPix'

export async function load(modelConfig?: ModelConfig) {
  await loadModel(modelConfig)
  return { ...MediaStream, ...ImageData }
}
