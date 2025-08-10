import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../stories/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@storybook/addon-docs', './local-preset.js'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
}
export default config
