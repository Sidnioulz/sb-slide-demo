import { initialiseSlideFeatures } from '../src/preset/slideUtils'

export const experimental_serverChannel = async (channel, options) => {
  const coreOptions = await options.presets.apply('core')
  initialiseSlideFeatures(channel, options, coreOptions)
  return channel
}
