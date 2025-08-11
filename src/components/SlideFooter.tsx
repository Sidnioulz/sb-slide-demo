import React from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
  EditIcon,
  PlusIcon,
} from '@storybook/icons'
import { addons } from 'storybook/preview-api'
import { NAVIGATE_URL } from 'storybook/internal/core-events'

import { Button } from './Button'
import './SlideFooter.css'
import { appendSlide, deleteSlide } from '../preview/clientRequests'
import {
  getAdjacentDocsStoryIds,
  getCurrentStoryId,
} from '../preview/indexUtils'

const channel = addons.getChannel()

export interface SlideFooterProps {
  onEditRequest: () => void
  prevUrl?: string
  nextUrl?: string
  className?: string
}

export const SlideFooter: React.FC<SlideFooterProps> = ({
  onEditRequest,
  prevUrl,
  nextUrl,
  className = '',
}) => {
  const adjacent = getAdjacentDocsStoryIds()
  const currentStoryId = getCurrentStoryId()
  const isLastSlide = adjacent[adjacent.length - 1] === currentStoryId

  return (
    <nav className={`slide-footer ${className}`} aria-label="Slide actions">
      <Button
        ariaLabel="Delete this slide"
        icon={TrashIcon}
        variant="danger"
        onClick={async () => {
          await deleteSlide(getCurrentStoryId())

          if (isLastSlide) {
            channel.emit(NAVIGATE_URL, prevUrl)
          }
        }}
      />
      <Button
        ariaLabel="Edit this slide"
        icon={EditIcon}
        variant="secondary"
        onClick={() => onEditRequest()}
      />
      {isLastSlide && (
        <Button
          ariaLabel="Add a new slide"
          icon={PlusIcon}
          variant="secondary"
          onClick={() => appendSlide()}
        />
      )}
      <span className="slide-footer__spacer" />
      <Button
        ariaLabel={prevUrl ? 'Previous page' : 'No previous page'}
        href={prevUrl}
        disabled={!prevUrl}
        icon={ChevronLeftIcon}
        variant="secondary"
        shortcut="Alt+ArrowLeft"
      />
      <Button
        ariaLabel={nextUrl ? 'Next page' : 'No next page'}
        href={nextUrl}
        disabled={!nextUrl}
        icon={ChevronRightIcon}
        variant="secondary"
        shortcut="Alt+ArrowRight"
      />
    </nav>
  )
}
