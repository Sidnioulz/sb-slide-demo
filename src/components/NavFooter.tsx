import React from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from '@storybook/icons'
import { Button } from './Button'
import './NavFooter.css'

export interface NavFooterProps {
  prevUrl?: string
  nextUrl?: string
  className?: string
}

export const NavFooter: React.FC<NavFooterProps> = ({
  prevUrl,
  nextUrl,
  className = '',
}) => {
  return (
    <nav className={`nav-footer ${className}`} aria-label="Page navigation">
      <div className="nav-footer__button-container nav-footer__button-container--prev">
        <Button
          text={prevUrl ? 'Previous page' : 'No previous page'}
          href={prevUrl}
          disabled={!prevUrl}
          icon={ChevronLeftIcon}
          iconLocation="start"
          variant="secondary"
          className="nav-footer__button"
          shortcut="Alt+ArrowLeft"
        />
      </div>
      <div className="nav-footer__button-container nav-footer__button-container--next">
        <Button
          text={nextUrl ? 'Next page' : 'No next page'}
          href={nextUrl}
          disabled={!nextUrl}
          icon={ChevronRightIcon}
          iconLocation="end"
          variant="secondary"
          className="nav-footer__button"
          shortcut="Alt+ArrowRight"
        />
      </div>
    </nav>
  )
}
