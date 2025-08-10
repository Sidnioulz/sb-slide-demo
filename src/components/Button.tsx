import React, { useMemo } from 'react'
import { NAVIGATE_URL } from 'storybook/internal/core-events'
import { addons } from 'storybook/preview-api'
import './Button.css'

const channel = addons.getChannel()

export type ButtonProps = {
  href?: string
  onClick?: () => void
  disabled?: boolean
  icon?: React.ComponentType<{ className?: string }>
  iconLocation?: 'start' | 'end'
  variant?: 'primary' | 'secondary'
  className?: string
  shortcut?: string
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
}) => {
  const classNames = [
    'button',
    `button--${variant}`,
    Icon && `button--icon-${iconLocation}`,
    className,
  ]
    .filter(Boolean)
    .join(' ')

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
          onClick?.()
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
    >
      {content}
    </button>
  )
}
