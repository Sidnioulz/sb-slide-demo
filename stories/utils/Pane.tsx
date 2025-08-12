import { styled } from 'storybook/theming'

export const RightSideDecoration = styled.div<{
  visibleWidth: string
  width: string
}>(
  ({ visibleWidth = '170px', width = '840px' }) => `
  position: absolute;
  right: 0;
  top: 50%;
  width: ${width};
  z-index: 2000;
  box-shadow: 0 0 30px color(from var(--color-bg-lighter) srgb r g b / 0.5);
  transform: translateY(-50%) translateX(calc(100% - ${visibleWidth}));
  transition: transform 0.4s ease-out;

  &:hover {
    transform: translateY(-50%) translateX(10%);
  }

  & pre {
    margin: 0;
  }
`,
)
