import { StoryContext } from '@storybook/react'
import { WindowWithIndex } from './types/WindowWithIndex'

/**
 * Returns the linked list item for a given storyId in our linked list
 * local index.
 */
export function getIndexLinkedListItem(storyId: string | undefined): {
  data: StoryContext
  prev?: string
  next?: string
} {
  const parentWindow = window.parent as Window & {
    __sb_linked: WindowWithIndex
  }

  if (!storyId) {
    throw new Error(`getIndexEntry called without storyId: ${storyId}`)
  }

  if (!(storyId in parentWindow.__sb_linked.index)) {
    throw new Error(`getIndexEntry failed to find storyId: ${storyId}`)
  }

  return parentWindow.__sb_linked.index[storyId]
}

/**
 * Returns the whole index entry for a given storyId.
 */
export function getIndexEntry(storyId: string | undefined): StoryContext {
  return getIndexLinkedListItem(storyId).data
}

/**
 * Returns the current story's storyId.
 */
export function getCurrentStoryId(): string {
  const parentWindow = window.parent as Window & {
    __sb_linked: WindowWithIndex
  }

  if (!parentWindow.__sb_linked.currentStoryId) {
    throw new Error(
      'currentStoryId missing in shared storage, called too early or something is broken.',
    )
  }

  return parentWindow.__sb_linked.currentStoryId
}

/**
 * Returns the whole index entry for the current story.
 */
export function getCurrentIndexEntry(): StoryContext {
  return getIndexEntry(getCurrentStoryId())
}

// TODO: move adjacent computation to manager.tsx for better caching.
function getAdjacentDocs(): StoryContext[] {
  const parentWindow = window.parent as Window & {
    __sb_linked: WindowWithIndex
  }
  const index = parentWindow.__sb_linked.index
  const storyId = getCurrentStoryId()

  const basePattern = storyId.replace(/\d+--docs$/, '')
  const numberPattern = /(\d+)--docs$/

  return Object.values(index)
    .filter((entry) => {
      const id = entry.data.id
      return id.startsWith(basePattern) && numberPattern.test(id)
    })
    .map((entry) => entry.data)
}

/**
 * Returns storyIds for all docs entries in the index that
 * belong to the same folder as the current story.
 */
export function getAdjacentDocsStoryIds(): string[] {
  return getAdjacentDocs().map((entry) => entry.id)
}

/**
 * Returns import paths for all docs entries in the index that
 * belong to the same folder as the current story.
 */
export function getAdjacentDocsImportPaths(): string[] {
  return getAdjacentDocs().map((entry) => entry.importPath)
}

export function getPreviousAdjacentDocsUrl(): string | undefined {
  const currentEntry = getIndexLinkedListItem(getCurrentStoryId())

  const basePattern = currentEntry.data.id.replace(/\d+--docs$/, '')
  const numberPattern = /(\d+)--docs$/

  const prevId = currentEntry.prev

  if (prevId && prevId.startsWith(basePattern) && numberPattern.test(prevId)) {
    return `?path=/docs/${prevId}`
  }

  return undefined
}

export function getNextAdjacentDocsUrl(): string | undefined {
  const currentEntry = getIndexLinkedListItem(getCurrentStoryId())

  const basePattern = currentEntry.data.id.replace(/\d+--docs$/, '')
  const numberPattern = /(\d+)--docs$/

  const nextId = currentEntry.next

  if (nextId && nextId.startsWith(basePattern) && numberPattern.test(nextId)) {
    return `?path=/docs/${nextId}`
  }

  return undefined
}
