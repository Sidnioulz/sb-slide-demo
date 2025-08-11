import React from 'react'
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  TrashIcon,
  EditIcon,
  PlusIcon,
} from '@storybook/icons'
import { Button } from './Button'
import './SlideFooter.css'
import { appendSlide, deleteSlide } from '../preview/clientRequests'
import {
  getAdjacentDocsStoryIds,
  getCurrentStoryId,
} from '../preview/indexUtils'

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
        onClick={() => deleteSlide(getCurrentStoryId())}
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
        variant="primary"
        shortcut="Alt+ArrowLeft"
      />
      <Button
        ariaLabel={nextUrl ? 'Next page' : 'No next page'}
        href={nextUrl}
        disabled={!nextUrl}
        icon={ChevronRightIcon}
        variant="primary"
        shortcut="Alt+ArrowRight"
      />
    </nav>
  )
}
