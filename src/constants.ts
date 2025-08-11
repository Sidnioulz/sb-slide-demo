export const ADDON_ID = 'storybook-addon-slideset'

export const EVENTS = {
  GET_SLIDE_SOURCE_REQUEST: `${ADDON_ID}/getSourceRequest`,
  GET_SLIDE_SOURCE_RESPONSE: `${ADDON_ID}/getSourceResponse`,
  SAVE_SLIDE_REQUEST: `${ADDON_ID}/saveRequest`,
  SAVE_SLIDE_RESPONSE: `${ADDON_ID}/saveResponse`,
  MOVE_SLIDE_UP_REQUEST: `${ADDON_ID}/moveSlideUpRequest`,
  MOVE_SLIDE_UP_RESPONSE: `${ADDON_ID}/moveSlideUpResponse`,
  MOVE_SLIDE_DOWN_REQUEST: `${ADDON_ID}/moveSlideDownRequest`,
  MOVE_SLIDE_DOWN_RESPONSE: `${ADDON_ID}/moveSlideDownResponse`,
  DELETE_SLIDE_REQUEST: `${ADDON_ID}/deleteSlideRequest`,
  DELETE_SLIDE_RESPONSE: `${ADDON_ID}/deleteSlideResponse`,
  INSERT_SLIDE_REQUEST: `${ADDON_ID}/insertSlideRequest`,
  INSERT_SLIDE_RESPONSE: `${ADDON_ID}/insertSlideResponse`,
}

export interface GetSlideSourceRequestPayload {
  storyId: string
  importPath: string
}

export interface GetSlideSourceResponsePayload {
  storyId: string
  content: string
}

export interface SaveSlideRequestPayload {
  storyId: string
  content: string
  importPath: string

  // Will be used for new stories?
  name?: string
}
export type SaveSlideResponsePayload = Record<string, never>
// Previous commented properties:
// {
//   storyId: string
//   newStoryId?: string
//   newStoryName?: string
//   newStoryExportName?: string
//   sourceFileContent?: string
//   sourceFileName?: string
//   sourceStoryName?: string
//   sourceStoryExportName?: string
// }

export interface MoveSlideUpRequestPayload {
  storyImportPath: string
  previousImportPath: string
}

export type MoveSlideUpResponsePayload = Record<string, never>

export interface MoveSlideDownRequestPayload {
  storyImportPath: string
  nextImportPath: string
}

export type MoveSlideDownResponsePayload = Record<string, never>

export interface DeleteSlideRequestPayload {
  targetImportPath: string
  allSlideImportPaths: string[]
}

export type DeleteSlideResponsePayload = Record<string, never>

export interface InsertSlideRequestPayload {
  insertAtIndex: number
  allSlideImportPaths: string[]
  content?: string
}

export interface InsertSlideResponsePayload {
  newImportPath: string
}
