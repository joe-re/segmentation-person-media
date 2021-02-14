import { BodyPix, load } from '@tensorflow-models/body-pix'
import { ModelConfig } from '@tensorflow-models/body-pix/dist/body_pix_model'

let net: BodyPix | null = null

export async function loadModel(modelConfig?: ModelConfig) {
  net = await load(modelConfig)
}

export function get() {
  if (!net) {
    throw new Error('Modal data has not been downloaded yet.')
  }
  return net
}