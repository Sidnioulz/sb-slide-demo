import React, { useMemo } from 'react'
import { NAVIGATE_URL } from 'storybook/internal/core-events'
import { addons } from 'storybook/preview-api'
import './Button.css'

const channel = addons.getChannel()

export type ButtonProps = {
  href?: string
  onClick?: (e: React.MouseEvent) => void
  disabled?: boolean
  icon?: React.ComponentType<{ className?: string }>
  iconLocation?: 'start' | 'end'
  variant?: 'primary' | 'secondary' | 'danger'
  className?: string
  shortcut?: string
  // Add drag event handlers
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
  draggable?: boolean
} & (
  | {
      text: string
      ariaLabel?: string
    }
  | {
      text?: string
      ariaLabel: string
    }
)

export const Button: React.FC<ButtonProps> = ({
  text,
  ariaLabel,
  href,
  onClick,
  disabled = false,
  icon: Icon,
  iconLocation = 'start',
  variant = 'secondary',
  className = '',
  shortcut,
  onDragStart,
  onDragEnd,
  draggable = false,
}) => {
  const classNames = [
    'button',
    `button--${variant}`,
    Icon && `button--icon-${iconLocation}`,
    draggable && 'button--draggable',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // Ensure drag events are properly handled for all browsers
  const dragProps =
    draggable && !disabled
      ? {
          onDragStart,
          onDragEnd,
        }
      : {}

  const content = (
    <>
      {Icon && <Icon className="button-icon" />}
      {!!text?.length && <span className="button-content">{text}</span>}
    </>
  )

  const shortcutLabel = useMemo(
    () =>
      shortcut
        ?.replace('Arrow', '')
        .replace('Space', '␣')
        .replace(/\+/g, ' + '),
    [shortcut],
  )

  const isInternalHref = href?.startsWith('?') || href?.startsWith('#')

  if (href && !disabled) {
    const finalOnClick = isInternalHref
      ? (e: React.MouseEvent) => {
          e.preventDefault()
          onClick?.(e)
          channel.emit(NAVIGATE_URL, href)
        }
      : onClick
    return (
      <a
        href={href}
        role="button"
        aria-label={ariaLabel}
        aria-keyshortcuts={shortcut}
        data-tooltip={shortcutLabel}
        data-tooltip-position={shortcut ? 'top' : undefined}
        className={classNames}
        onClick={finalOnClick}
        draggable={draggable && !disabled}
        {...dragProps}
      >
        {content}
      </a>
    )
  }
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-keyshortcuts={shortcut}
      data-tooltip={shortcutLabel}
      data-tooltip-position={shortcut ? 'top' : undefined}
      className={classNames}
      onClick={disabled ? undefined : onClick}
      aria-disabled={disabled}
      draggable={draggable && !disabled}
      {...dragProps}
    >
      {content}
    </button>
  )
}
