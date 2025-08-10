import React, { useState } from 'react'

import './Slide.css'

import { SlideFooter } from './SlideFooter'
import { WindowWithIndex } from '../types/WindowWithIndex'
import { SlideEditor } from './SlideEditor'

export interface SlideProps {
  children: React.ReactNode
}

export const Slide: React.FC<SlideProps> = ({ children }) => {
  const [isEditing, setIsEditing] = useState(false)

  const parentWindow = window.parent as Window & {
    __sb_linked: WindowWithIndex
  }

  if (!isEditing) {
    return (
      <main className="slide">
        <div className="slide-content">{children}</div>
        <SlideFooter
          onEditRequest={() => setIsEditing(true)}
          prevUrl={
            parentWindow.__sb_linked.prevPath
              ? `?path=${parentWindow.__sb_linked.prevPath}`
              : undefined
          }
          nextUrl={
            parentWindow.__sb_linked.nextPath
              ? `?path=${parentWindow.__sb_linked.nextPath}`
              : undefined
          }
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
