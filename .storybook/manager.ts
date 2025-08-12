import { addons } from 'storybook/manager-api'
import Events from 'storybook/internal/core-events'
import { ADDON_ID } from '../src/constants'
import {
  refreshCurrentStoryLinks,
  refreshIndex,
} from '../src/manager/eventHandlers'
import { renderLabel } from '../src/manager/sidebar'

addons.setConfig({
  layoutCustomisations: {
    showSidebar: ({ storyId }, defaultValue) =>
      storyId?.startsWith('slide-') ? false : defaultValue,
    showToolbar: ({ viewMode }, defaultValue) =>
      viewMode !== 'docs' ? defaultValue : false,
  },
  sidebar: {
    renderLabel,
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

  api.setAddonState(ADDON_ID, {
    isDragging: false,
  })
})
