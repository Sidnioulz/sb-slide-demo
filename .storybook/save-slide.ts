import fs from 'node:fs/promises'
import path from 'node:path'

import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import { visit } from 'unist-util-visit'
import type { Channel } from 'storybook/internal/channels'
import type { RequestData, ResponseData } from 'storybook/internal/core-events'
import { logger } from 'storybook/internal/node-logger'

import {
  EVENTS,
  GetSlideSourceRequestPayload,
  GetSlideSourceResponsePayload,
  SaveSlideRequestPayload,
  SaveSlideResponsePayload,
} from '../src/types/constants'
import type { BlockContent, DefinitionContent, Root } from 'mdast'
import type { MdxJsxFlowElement } from 'mdast-util-mdx-jsx'

/**
 * Extracts the content inside the first Slide component in an MDX file.
 * Uses proper AST traversal to find and extract the content.
 */
export async function extractSlide(
  storyId: string,
  importPath: string,
): Promise<string> {
  const sourceFilePath = path.join(process.cwd(), importPath)
  const sourceFileContent = await fs.readFile(sourceFilePath, 'utf8')

  const ast = remark().use(remarkMdx).parse(sourceFileContent)

  let slideChildren: (BlockContent | DefinitionContent)[] = []
  let slideFound = false

  visit(ast, 'mdxJsxFlowElement', (node) => {
    if (node.name === 'Slide' && !slideFound) {
      slideChildren = node.children
      slideFound = true
      return false
    }
  })

  if (!slideFound || slideChildren.length === 0) {
    throw new Error(`No Slide component found in file ${importPath}`)
  }

  const contentAst: Root = {
    type: 'root',
    children: slideChildren,
  }

  const result = remark().use(remarkMdx).stringify(contentAst)
  return result.toString().trim()
}

/**
 * Replaces the content inside the first Slide component in an MDX file.
 * Uses proper AST manipulation to modify the content.
 */
export async function replaceSlideContent(
  sourceContent: string,
  newContent: string,
): Promise<string> {
  const sourceAst = remark().use(remarkMdx).parse(sourceContent)

  let contentAst: MdxJsxFlowElement
  try {
    contentAst = remark()
      .use(remarkMdx)
      .parse(newContent) as unknown as MdxJsxFlowElement
  } catch (error) {
    throw new Error(
      `Invalid MDX content: ${error instanceof Error ? error.message : String(error)}`,
    )
  }

  let slideReplaced = false
  visit(sourceAst, 'mdxJsxFlowElement', (node) => {
    if (node.name === 'Slide' && !slideReplaced) {
      node.children = contentAst.children
      slideReplaced = true
      return false
    }
  })

  if (!slideReplaced) {
    throw new Error('No Slide component found in the source file')
  }

  const result = remark().use(remarkMdx).stringify(sourceAst)

  return result.toString()
}

export function initialiseSaveSlide(channel: Channel) {
  channel.on(
    EVENTS.GET_SLIDE_SOURCE_REQUEST,
    async ({ id, payload }: RequestData<GetSlideSourceRequestPayload>) => {
      const { storyId, importPath } = payload
      logger.debug(`Request for slide source content for story ${storyId}`)
      try {
        const content = await extractSlide(storyId, importPath)
        channel.emit(EVENTS.GET_SLIDE_SOURCE_RESPONSE, {
          id,
          success: true,
          error: null,
          payload: { content, storyId },
        } satisfies ResponseData<GetSlideSourceResponsePayload>)
      } catch (error: unknown) {
        channel.emit(EVENTS.GET_SLIDE_SOURCE_RESPONSE, {
          id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        } satisfies ResponseData<GetSlideSourceResponsePayload>)

        logger.error(
          `Error getting slide source content for story ${storyId}:\n${error instanceof Error ? error.stack || error.message || error.toString() : error}`,
        )
      }
    },
  )

  channel.on(
    EVENTS.SAVE_SLIDE_REQUEST,
    async ({ id, payload }: RequestData<SaveSlideRequestPayload>) => {
      const { importPath, content } = payload

      let sourceFilePath: string | undefined

      try {
        sourceFilePath = path.join(process.cwd(), importPath)

        const sourceFileOriginalContent = await fs.readFile(
          sourceFilePath,
          'utf8',
        )
        const updatedContent = await replaceSlideContent(
          sourceFileOriginalContent,
          content,
        )
        await fs.writeFile(sourceFilePath, updatedContent, 'utf8')

        channel.emit(EVENTS.SAVE_SLIDE_RESPONSE, {
          id,
          success: true,
          error: null,
          payload: {},
        } satisfies ResponseData<SaveSlideResponsePayload>)
      } catch (error: unknown) {
        channel.emit(EVENTS.SAVE_SLIDE_RESPONSE, {
          id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        } satisfies ResponseData<SaveSlideResponsePayload>)

        logger.error(
          `Error writing to ${sourceFilePath}:\n${error instanceof Error ? error.stack || error.message || error.toString() : error}`,
        )
      }
    },
  )
}
