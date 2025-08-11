import { addons } from 'storybook/manager-api'
import Events from 'storybook/internal/core-events'
import { WindowWithIndex } from '../src/preview/types/WindowWithIndex'
import { ADDON_ID } from '../src/constants'

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
    throw new Error(
      'Attempted to compute current story links without a story id.',
    )
  }

  // This is only here to ensure the index is fresh before we consume it.
  // Can help on initial load if we come from localhost:6006 with no story path.
  let index = window.__sb_linked.index
  if (!index) {
    await refreshIndex()
  }

  index = window.__sb_linked.index
  if (!index) {
    throw new Error(
      'Attempted to use current story index data before the index was fetched.',
    )
  }

  const entry = index[storyId]
  if (!entry) {
    throw new Error(`No story found in index for ID: ${storyId}`)
  }

  window.__sb_linked.currentStoryId = storyId
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
