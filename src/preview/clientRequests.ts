import { experimental_requestResponse } from 'storybook/manager-api'
import { addons } from 'storybook/preview-api'

import {
  EVENTS,
  GetSlideSourceRequestPayload,
  GetSlideSourceResponsePayload,
  type SaveSlideRequestPayload,
  type SaveSlideResponsePayload,
  type MoveSlideUpRequestPayload,
  type MoveSlideUpResponsePayload,
  type MoveSlideDownRequestPayload,
  type MoveSlideDownResponsePayload,
  type DeleteSlideRequestPayload,
  type DeleteSlideResponsePayload,
  type InsertSlideRequestPayload,
  type InsertSlideResponsePayload,
} from '../constants'
import {
  getAdjacentDocsImportPaths,
  getCurrentIndexEntry,
  getIndexEntry,
} from './indexUtils'

// Yep, that's ok. addons is a singleton.
// If calling from MDX we must use the preview channel.
// If we called from a manager addon, we'd need the manager channel.
const channel = addons.getChannel()

export async function moveSlideUp(
  storyImportPath: string,
  previousImportPath: string,
): Promise<void> {
  await experimental_requestResponse<
    MoveSlideUpRequestPayload,
    MoveSlideUpResponsePayload
  >(channel, EVENTS.MOVE_SLIDE_UP_REQUEST, EVENTS.MOVE_SLIDE_UP_RESPONSE, {
    storyImportPath,
    previousImportPath,
  })
}

// Move slide down (swap with next slide)
export async function moveSlideDown(
  storyImportPath: string,
  nextImportPath: string,
): Promise<void> {
  await experimental_requestResponse<
    MoveSlideDownRequestPayload,
    MoveSlideDownResponsePayload
  >(channel, EVENTS.MOVE_SLIDE_DOWN_REQUEST, EVENTS.MOVE_SLIDE_DOWN_RESPONSE, {
    storyImportPath,
    nextImportPath,
  })
}

// FIXME: must navigate if on last page
// FIXME: bug where deleting slide 4 also removes slide 5 from the index (but not fs)
export async function deleteSlide(storyId: string): Promise<void> {
  const allSlideImportPaths = getAdjacentDocsImportPaths()
  const targetEntry = getIndexEntry(storyId)

  await experimental_requestResponse<
    DeleteSlideRequestPayload,
    DeleteSlideResponsePayload
  >(channel, EVENTS.DELETE_SLIDE_REQUEST, EVENTS.DELETE_SLIDE_RESPONSE, {
    allSlideImportPaths,
    targetImportPath: targetEntry.importPath,
  })
}

// TODO always navigate to the new slide because reactivity is missing.
export async function insertSlideAt(
  insertAtIndex: number,
  content: string = '',
): Promise<string> {
  const allSlideImportPaths = getAdjacentDocsImportPaths()

  const response = await experimental_requestResponse<
    InsertSlideRequestPayload,
    InsertSlideResponsePayload
  >(channel, EVENTS.INSERT_SLIDE_REQUEST, EVENTS.INSERT_SLIDE_RESPONSE, {
    allSlideImportPaths,
    insertAtIndex,
    content,
  })

  return response.newImportPath
}

// TODO always navigate to the new slide because reactivity is missing.
export async function appendSlide(content: string = ''): Promise<string> {
  const allSlideImportPaths = getAdjacentDocsImportPaths()

  const response = await experimental_requestResponse<
    InsertSlideRequestPayload,
    InsertSlideResponsePayload
  >(channel, EVENTS.INSERT_SLIDE_REQUEST, EVENTS.INSERT_SLIDE_RESPONSE, {
    allSlideImportPaths,
    insertAtIndex: allSlideImportPaths.length,
    content,
  })

  return response.newImportPath
}

export async function getCurrentSlideContent(): Promise<string> {
  const indexEntry = getCurrentIndexEntry()

  const response = await experimental_requestResponse<
    GetSlideSourceRequestPayload,
    GetSlideSourceResponsePayload
  >(
    channel,
    EVENTS.GET_SLIDE_SOURCE_REQUEST,
    EVENTS.GET_SLIDE_SOURCE_RESPONSE,
    {
      storyId: indexEntry.id,
      importPath: indexEntry.importPath,
    },
  )
  return response.content
}

export async function saveCurrentSlide(content: string): Promise<void> {
  const indexEntry = getCurrentIndexEntry()

  await experimental_requestResponse<
    SaveSlideRequestPayload,
    SaveSlideResponsePayload
  >(channel, EVENTS.SAVE_SLIDE_REQUEST, EVENTS.SAVE_SLIDE_RESPONSE, {
    storyId: indexEntry.id,
    importPath: indexEntry.importPath,
    content,
  })
}
