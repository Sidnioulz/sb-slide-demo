import React, { useState, useEffect } from 'react'
import { experimental_requestResponse } from 'storybook/manager-api'
import { addons } from 'storybook/preview-api'
import { SaveIcon } from '@storybook/icons'

import {
  EVENTS,
  GetSlideSourceRequestPayload,
  GetSlideSourceResponsePayload,
  type SaveSlideRequestPayload,
  type SaveSlideResponsePayload,
} from '../types/constants'
import { getCurrentStory } from '../utils/getCurrentStory'

import './Slide.css'
import { WindowWithIndex } from '../types/WindowWithIndex'
import { Button } from './Button'

export interface SlideEditorProps {
  onCancel: () => void
  onSuccessfulEdit: () => void
}

// Yep, that's ok. addons is a singleton.
const channel = addons.getChannel()

const EditorLoader = () => {
  const [extractedContent, setExtractedContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const indexEntry = getCurrentStory()

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

        setExtractedContent(response.content)
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [])

  if (error) {
    return (
      <div className="slide-edit-error">
        Error loading content: {error.message}
      </div>
    )
  }

  if (isLoading) {
    return <div className="slide-edit-loading">Loading slide content...</div>
  }

  return (
    <textarea
      className="slide-edit-textarea"
      name="editor"
      rows={30}
      defaultValue={extractedContent}
    />
  )
}

export const SlideEditor: React.FC<SlideEditorProps> = ({
  onCancel,
  onSuccessfulEdit,
}) => {
  const parentWindow = window.parent as Window & {
    __sb_linked: WindowWithIndex
  }

  return (
    <main className="sb-unstyled">
      <header className="slide-edit-header">
        <h2 className="slide-edit-title">
          <label htmlFor="editor">Edit Slide Content</label>
        </h2>
        <Button
          text="Cancel"
          onClick={() => onCancel?.()}
          variant="secondary"
          className="slide-edit-button"
        />
        <Button
          text="Save"
          icon={SaveIcon}
          onClick={async () => {
            const storyId = parentWindow.__sb_linked.currentStoryId
            if (!storyId) {
              throw new Error(
                'Attempted to save slide without a current story id.',
              )
            }
            const indexEntry = parentWindow.__sb_linked.index[storyId].data

            await experimental_requestResponse<
              SaveSlideRequestPayload,
              SaveSlideResponsePayload
            >(channel, EVENTS.SAVE_SLIDE_REQUEST, EVENTS.SAVE_SLIDE_RESPONSE, {
              storyId,
              importPath: indexEntry.importPath,
              content: document.getElementsByTagName('textarea')[0].value,
            })

            // TODO analyse response and show a toast.

            onSuccessfulEdit?.()
          }}
          variant="primary"
          className="slide-edit-button"
        />
      </header>

      <EditorLoader />
    </main>
  )
}
