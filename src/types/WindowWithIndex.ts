import { StoryContext } from 'storybook/internal/types'

export interface WindowWithIndex {
  currentStoryId?: string
  prevPath?: string
  nextPath?: string
  index: Record<string, { data: StoryContext; prev?: string; next?: string }>
}
