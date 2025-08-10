import { initialiseSaveSlide } from './save-slide'

export const experimental_serverChannel = async (channel, options) => {
  const coreOptions = await options.presets.apply('core')

  initialiseSaveSlide(channel, options, coreOptions)
  // TODO initCreateNewSlideChannel(channel, options, coreOptions)

  return channel
}
