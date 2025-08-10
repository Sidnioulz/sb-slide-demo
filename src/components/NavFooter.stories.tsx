import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { NavFooter } from './NavFooter'

const meta: Meta<typeof NavFooter> = {
  title: 'Components/NavFooter',
  component: NavFooter,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A navigation footer component with previous and next page buttons. Uses logical properties for RTL support and includes proper WCAG compliance.',
      },
    },
  },
  argTypes: {
    prevUrl: {
      control: 'text',
      description:
        'URL for the previous page. If not provided, the button will be disabled.',
    },
    nextUrl: {
      control: 'text',
      description:
        'URL for the next page. If not provided, the button will be disabled.',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    prevUrl: '/previous-page',
    nextUrl: '/next-page',
  },
}

export const FirstPage: Story = {
  args: {
    prevUrl: undefined,
    nextUrl: '/page-2',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Navigation footer on the first page - only next button is enabled.',
      },
    },
  },
}

export const LastPage: Story = {
  args: {
    prevUrl: '/page-9',
    nextUrl: undefined,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Navigation footer on the last page - only previous button is enabled.',
      },
    },
  },
}

export const BothDisabled: Story = {
  args: {
    prevUrl: undefined,
    nextUrl: undefined,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Navigation footer with both buttons disabled - shows empty state copy.',
      },
    },
  },
}

export const InContainer: Story = {
  args: {
    prevUrl: '/previous-page',
    nextUrl: '/next-page',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          padding: '2rem',
          backgroundColor: '#f5f5f5',
        }}
      >
        <div
          style={{
            minHeight: '300px',
            backgroundColor: '#e8e8e8',
            padding: '2rem',
            marginBottom: '2rem',
            borderRadius: '8px',
          }}
        >
          <h1>Sample Page Content</h1>
          <p>
            This demonstrates how the navigation footer appears at the bottom of
            a page with content above it.
          </p>
        </div>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          'Navigation footer in a realistic page context with content above it.',
      },
    },
  },
}
