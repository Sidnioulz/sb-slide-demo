import React, { useState, useEffect } from 'react'
import { SaveIcon } from '@storybook/icons'

import { Button } from './Button'
import {
  getCurrentSlideContent,
  saveCurrentSlide,
} from '../preview/clientRequests'

import './Slide.css'

export interface SlideEditorProps {
  onCancel: () => void
  onSuccessfulEdit: () => void
}

const EditorLoader = () => {
  const [extractedContent, setExtractedContent] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setExtractedContent(await getCurrentSlideContent())
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
            await saveCurrentSlide(
              document.getElementsByTagName('textarea')[0].value,
            )

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
