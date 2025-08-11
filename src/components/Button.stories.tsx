import React from 'react'

import type { Meta, StoryObj } from '@storybook/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@storybook/icons'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A flexible, accessible button component that can be used as a link or button. Supports icons at start or end positions using logical properties for RTL support.',
      },
    },
  },
  argTypes: {
    text: {
      control: 'text',
      description: 'The text content of the button',
    },
    ariaLabel: {
      control: 'text',
      description:
        'The accessible label of the button, mandatory if text is skipped',
    },
    href: {
      control: 'text',
      description: 'If provided, the button will render as a link',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'danger'],
      description: 'Visual style variant of the button',
    },
    iconLocation: {
      control: { type: 'select' },
      options: ['start', 'end'],
      description: 'Position of the icon relative to text',
    },
    shortcut: {
      control: 'text',
      description: 'Keyboard shortcut for the button (shows in tooltip)',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    text: 'Button',
    variant: 'secondary',
  },
}

export const Primary: Story = {
  args: {
    text: 'Primary Button',
    variant: 'primary',
  },
}

export const Secondary: Story = {
  args: {
    text: 'Secondary Button',
    variant: 'secondary',
  },
}

export const WithIconStart: Story = {
  args: {
    text: 'Previous',
    icon: ChevronLeftIcon,
    iconLocation: 'start',
    variant: 'secondary',
  },
}

export const WithIconEnd: Story = {
  args: {
    text: 'Next',
    icon: ChevronRightIcon,
    iconLocation: 'end',
    variant: 'secondary',
  },
}

export const AsLink: Story = {
  args: {
    text: 'Link Button',
    href: '#',
    variant: 'primary',
  },
}

export const Disabled: Story = {
  args: {
    text: 'Disabled Button',
    disabled: true,
    variant: 'secondary',
  },
}

export const DisabledWithIcon: Story = {
  args: {
    text: 'No previous page',
    icon: ChevronLeftIcon,
    iconLocation: 'start',
    disabled: true,
    variant: 'secondary',
  },
}

export const WithShortcut: Story = {
  args: {
    text: 'Save',
    variant: 'primary',
    shortcut: 'Ctrl+S',
  },
}

export const WithShortcutAndIcon: Story = {
  args: {
    text: 'Next',
    icon: ChevronRightIcon,
    iconLocation: 'end',
    variant: 'secondary',
    shortcut: 'Ctrl+N',
  },
}

export const Shortcut: Story = {
  args: {
    text: 'Save',
    variant: 'primary',
    shortcut: 'Ctrl+S',
  },
}

export const Debug: Story = {
  args: {
    text: 'Primary Button !',
    variant: 'primary',
  },
}
