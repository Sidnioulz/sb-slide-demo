import { addons } from 'storybook/manager-api'
import Events from 'storybook/internal/core-events'
import { WindowWithIndex } from '../src/types/WindowWithIndex'
import { ADDON_ID } from '../src/types/constants'

declare global {
  interface Window {
    __sb_linked: WindowWithIndex
  }
}
window.__sb_linked = {
  index: {},
}

async function refreshIndex() {
  const response = await fetch('/index.json')
  if (!response.ok) {
    throw new Error('Failed to fetch index.json')
  }
  const index = await response.json()

  if (index.v !== 5) {
    throw new Error('Unsupported index version: ' + index.v)
  }

  const entries = Object.entries(index.entries)
  const result = {}

  entries.forEach((entry, i) => {
    const [key, value] = entry
    result[key] = {
      data: value,
      prev: i > 0 ? entries[i - 1][0] : undefined,
      next: i < entries.length - 1 ? entries[i + 1][0] : undefined,
    }
  })

  window.__sb_linked.index = result
}

async function refreshCurrentStoryLinks(storyId?: string) {
  if (!storyId) {
    window.__sb_linked.prevPath = undefined
    window.__sb_linked.nextPath = undefined
    throw new Error(
      'Attempted to compute current story links without a story id.',
    )
  }

  let index = window.__sb_linked.index
  if (!index) {
    await refreshIndex()
  }

  index = window.__sb_linked.index
  if (!index) {
    window.__sb_linked.prevPath = undefined
    window.__sb_linked.nextPath = undefined
    throw new Error(
      'Attempted to use current story index data before the index was fetched.',
    )
  }

  const entry = index[storyId]
  if (!entry) {
    window.__sb_linked.prevPath = undefined
    window.__sb_linked.nextPath = undefined
    throw new Error(`No story found in index for ID: ${storyId}`)
  }

  const { prev, next } = entry

  const prevEntry = prev ? index[prev] : undefined
  const nextEntry = next ? index[next] : undefined

  window.__sb_linked.currentStoryId = storyId

  window.__sb_linked.prevPath = prevEntry
    ? `/${prevEntry.data.type}/${prevEntry.data.id}`
    : undefined
  window.__sb_linked.nextPath = nextEntry
    ? `/${nextEntry.data.type}/${nextEntry.data.id}`
    : undefined
}
//
//
// END TODO move to other files

addons.setConfig({
  layoutCustomisations: {
    showSidebar: ({ storyId }, defaultValue) =>
      storyId?.startsWith('slide-') ? false : defaultValue,
    showToolbar: ({ viewMode }, defaultValue) =>
      viewMode !== 'docs' ? defaultValue : false,
  },
})

addons.register(ADDON_ID, async (api) => {
  api.on(Events.STORY_INDEX_INVALIDATED, refreshIndex)
  api.on(Events.SET_CURRENT_STORY, async ({ storyId }) =>
    refreshCurrentStoryLinks(storyId),
  )

  await refreshIndex()
  const { storyId } = api.getUrlState()
  await refreshCurrentStoryLinks(storyId)
})
