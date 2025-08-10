import React from 'react'
import { ChevronLeftIcon, ChevronRightIcon, EditIcon } from '@storybook/icons'
import { Button } from './Button'
import './SlideFooter.css'

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
  return (
    <nav className={`slide-footer ${className}`} aria-label="Slide actions">
      <Button
        ariaLabel="Edit this slide"
        icon={EditIcon}
        variant="secondary"
        className="slide-footer__button slide-footer__start"
        onClick={() => onEditRequest()}
      />
      <span className="slide-footer__spacer" />
      <Button
        text={prevUrl ? undefined : 'No previous page'}
        ariaLabel={prevUrl ? 'Previous page' : 'No previous page'}
        href={prevUrl}
        disabled={!prevUrl}
        icon={ChevronLeftIcon}
        variant="primary"
        className="slide-footer__button slide-footer__end"
        shortcut="Alt+ArrowLeft"
      />
      <Button
        text={nextUrl ? undefined : 'No next page'}
        ariaLabel={nextUrl ? 'Next page' : 'No next page'}
        href={nextUrl}
        disabled={!nextUrl}
        icon={ChevronRightIcon}
        variant="primary"
        className="slide-footer__button slide-footer__end"
        shortcut="Alt+ArrowRight"
      />
    </nav>
  )
}
