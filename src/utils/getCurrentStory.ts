import { StoryContext } from '@storybook/react'
import { WindowWithIndex } from 'src/types/WindowWithIndex'

export function getCurrentStory(): StoryContext {
  const parentWindow = window.parent as Window & {
    __sb_linked: WindowWithIndex
  }

  const storyId = parentWindow.__sb_linked.currentStoryId
  if (!storyId) {
    throw new Error('No current storyId.')
  }
  const indexEntry = parentWindow.__sb_linked.index[storyId].data

  return indexEntry
}
