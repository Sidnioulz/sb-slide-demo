import React, { useState } from 'react'

import { SlideFooter } from './SlideFooter'
import { SlideEditor } from './SlideEditor'
import {
  getPreviousAdjacentDocsUrl,
  getNextAdjacentDocsUrl,
} from '../preview/indexUtils'

import './Slide.css'

export interface SlideProps {
  children: React.ReactNode
}

export const Slide: React.FC<SlideProps> = ({ children }) => {
  const [isEditing, setIsEditing] = useState(false)

  if (!isEditing) {
    return (
      <main className="slide">
        <div className="slide-content sb-unstyled">{children}</div>
        <SlideFooter
          onEditRequest={() => setIsEditing(true)}
          prevUrl={getPreviousAdjacentDocsUrl()}
          nextUrl={getNextAdjacentDocsUrl()}
          className="sb-unstyled slide-footer"
        />
      </main>
    )
  }

  return (
    <SlideEditor
      onCancel={() => setIsEditing(false)}
      onSuccessfulEdit={() => setIsEditing(false)}
    />
  )
}
