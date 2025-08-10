export const ADDON_ID = 'storybook-addon-slideset'

export const EVENTS = {
  GET_SLIDE_SOURCE_REQUEST: `${ADDON_ID}/getSourceRequest`,
  GET_SLIDE_SOURCE_RESPONSE: `${ADDON_ID}/getSourceResponse`,
  SAVE_SLIDE_REQUEST: `${ADDON_ID}/saveRequest`,
  SAVE_SLIDE_RESPONSE: `${ADDON_ID}/saveResponse`,
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
export interface SaveSlideResponsePayload {
  // storyId: string
  // newStoryId?: string
  // newStoryName?: string
  // newStoryExportName?: string
  // sourceFileContent?: string
  // sourceFileName?: string
  // sourceStoryName?: string
  // sourceStoryExportName?: string
}
