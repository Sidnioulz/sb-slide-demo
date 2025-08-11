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
  MoveSlideUpRequestPayload,
  MoveSlideUpResponsePayload,
  MoveSlideDownRequestPayload,
  MoveSlideDownResponsePayload,
  DeleteSlideRequestPayload,
  DeleteSlideResponsePayload,
  InsertSlideRequestPayload,
  InsertSlideResponsePayload,
} from '../constants'
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

  if (!slideFound) {
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

/**
 * Reads a slide file and returns its content
 */
async function readSlideFile(importPath: string): Promise<string> {
  const sourceFilePath = path.join(process.cwd(), importPath)
  return await fs.readFile(sourceFilePath, 'utf8')
}

/**
 * Writes content to a slide file
 */
async function writeSlideFile(
  importPath: string,
  content: string,
): Promise<void> {
  const sourceFilePath = path.join(process.cwd(), importPath)
  await fs.writeFile(sourceFilePath, content, 'utf8')
}

/**
 * Swaps the content of two slides
 */
export async function swapSlideContents(
  importPath1: string,
  importPath2: string,
): Promise<void> {
  // Read both files
  const content1 = await readSlideFile(importPath1)
  const content2 = await readSlideFile(importPath2)

  // Extract slide content from both files
  const slideContent1 = await extractSlide('', importPath1)
  const slideContent2 = await extractSlide('', importPath2)

  // Replace content in each file with the other's content
  const updatedContent1 = await replaceSlideContent(content1, slideContent2)
  const updatedContent2 = await replaceSlideContent(content2, slideContent1)

  // Write the modified content back to the files
  await writeSlideFile(importPath1, updatedContent1)
  await writeSlideFile(importPath2, updatedContent2)
}

/**
 * Creates a new slide file with default template and content
 */
export async function createSlideFile(
  slideNumber: number,
  content: string = '',
): Promise<string> {
  const slidesDir = 'stories/slides'
  const newImportPath = `${slidesDir}/${slideNumber}.mdx`
  const newFilePath = path.join(process.cwd(), newImportPath)

  // Create default template
  const defaultTemplate = `import { Meta } from "@storybook/addon-docs/blocks";

import "../../src/base.css";
import { Slide } from "../../src/components/Slide";

<Meta title="Slide ${slideNumber}" />

<Slide>
${content}
</Slide>`

  // Ensure directory exists
  await fs.mkdir(path.dirname(newFilePath), { recursive: true })

  // Write the file
  await fs.writeFile(newFilePath, defaultTemplate, 'utf8')

  return newImportPath
}

/**
 * Deletes a slide file
 */
export async function deleteSlideFile(importPath: string): Promise<void> {
  const filePath = path.join(process.cwd(), importPath)
  await fs.unlink(filePath)
}

export function initialiseSlideFeatures(channel: Channel) {
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

  // Move slide UP handler
  channel.on(
    EVENTS.MOVE_SLIDE_UP_REQUEST,
    async ({ id, payload }: RequestData<MoveSlideUpRequestPayload>) => {
      const { storyImportPath, previousImportPath } = payload

      logger.debug(
        `Request to move slide up: ${storyImportPath} with ${previousImportPath}`,
      )

      try {
        await swapSlideContents(storyImportPath, previousImportPath)

        channel.emit(EVENTS.MOVE_SLIDE_UP_RESPONSE, {
          id,
          success: true,
          error: null,
          payload: {},
        } satisfies ResponseData<MoveSlideUpResponsePayload>)
      } catch (error: unknown) {
        channel.emit(EVENTS.MOVE_SLIDE_UP_RESPONSE, {
          id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        } satisfies ResponseData<MoveSlideUpResponsePayload>)

        logger.error(
          `Error moving slide up: ${storyImportPath} with ${previousImportPath}:\n${error instanceof Error ? error.stack || error.message || error.toString() : error}`,
        )
      }
    },
  )

  // Move slide DOWN handler
  channel.on(
    EVENTS.MOVE_SLIDE_DOWN_REQUEST,
    async ({ id, payload }: RequestData<MoveSlideDownRequestPayload>) => {
      const { storyImportPath, nextImportPath } = payload

      logger.debug(
        `Request to move slide down: ${storyImportPath} with ${nextImportPath}`,
      )

      try {
        await swapSlideContents(storyImportPath, nextImportPath)

        channel.emit(EVENTS.MOVE_SLIDE_DOWN_RESPONSE, {
          id,
          success: true,
          error: null,
          payload: {},
        } satisfies ResponseData<MoveSlideDownResponsePayload>)
      } catch (error: unknown) {
        channel.emit(EVENTS.MOVE_SLIDE_DOWN_RESPONSE, {
          id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        } satisfies ResponseData<MoveSlideDownResponsePayload>)

        logger.error(
          `Error moving slide down: ${storyImportPath} with ${nextImportPath}:\n${error instanceof Error ? error.stack || error.message || error.toString() : error}`,
        )
      }
    },
  )

  // Delete slide handler
  channel.on(
    EVENTS.DELETE_SLIDE_REQUEST,
    async ({ id, payload }: RequestData<DeleteSlideRequestPayload>) => {
      const { targetImportPath, allSlideImportPaths } = payload

      logger.debug(`Request to delete slide: ${targetImportPath}`)

      try {
        const targetIndex = allSlideImportPaths.indexOf(targetImportPath)

        if (targetIndex === -1) {
          throw new Error(
            `Target slide not found in slide list: ${targetImportPath}`,
          )
        }

        // Shift all subsequent slides down by one position
        for (let i = targetIndex; i < allSlideImportPaths.length - 1; i++) {
          const currentPath = allSlideImportPaths[i]
          const nextPath = allSlideImportPaths[i + 1]

          // Extract content from the next slide
          const nextSlideContent = await extractSlide('', nextPath)

          // Replace current slide content with the next slide's content
          const currentSlideFileContent = await readSlideFile(currentPath)
          const updatedContent = await replaceSlideContent(
            currentSlideFileContent,
            nextSlideContent,
          )

          await writeSlideFile(currentPath, updatedContent)
        }

        // Delete the last slide file since we've shifted everything down
        await deleteSlideFile(
          allSlideImportPaths[allSlideImportPaths.length - 1],
        )

        channel.emit(EVENTS.DELETE_SLIDE_RESPONSE, {
          id,
          success: true,
          error: null,
          payload: {},
        } satisfies ResponseData<DeleteSlideResponsePayload>)
      } catch (error: unknown) {
        channel.emit(EVENTS.DELETE_SLIDE_RESPONSE, {
          id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        } satisfies ResponseData<DeleteSlideResponsePayload>)

        logger.error(
          `Error deleting slide: ${targetImportPath}:\n${error instanceof Error ? error.stack || error.message || error.toString() : error}`,
        )
      }
    },
  )

  // Insert slide handler
  channel.on(
    EVENTS.INSERT_SLIDE_REQUEST,
    async ({ id, payload }: RequestData<InsertSlideRequestPayload>) => {
      const { insertAtIndex, allSlideImportPaths, content = '' } = payload

      logger.debug(`Request to insert slide at index: ${insertAtIndex}`)

      try {
        // Get the next slide number (max + 1)
        const slideNumbers = allSlideImportPaths.map((importPath) => {
          const match = importPath.match(/\/(\d+)\.mdx$/)
          return match ? parseInt(match[1], 10) : 0
        })

        const maxSlideNumber = Math.max(...slideNumbers, 0)
        const newSlideNumber = maxSlideNumber + 1

        // Create the new slide file
        const newImportPath = await createSlideFile(newSlideNumber, content)

        // Shift slides from the insertion point to make room for the new slide
        // We need to move from the end toward the insertion point
        for (let i = allSlideImportPaths.length - 1; i >= insertAtIndex; i--) {
          // Only process if we have a slide at the current position
          if (i < allSlideImportPaths.length) {
            const currentPath = allSlideImportPaths[i]
            const nextPath =
              i === allSlideImportPaths.length - 1
                ? newImportPath
                : allSlideImportPaths[i + 1]

            // Extract content from the current slide
            const currentSlideContent = await extractSlide('', currentPath)

            // Write current slide content to the next slide position
            const nextSlideFileContent = await readSlideFile(nextPath)
            const updatedNextContent = await replaceSlideContent(
              nextSlideFileContent,
              currentSlideContent,
            )

            await writeSlideFile(nextPath, updatedNextContent)
          }
        }

        // If inserting at a position other than the end, update the target position
        if (insertAtIndex < allSlideImportPaths.length) {
          // For insert at beginning or middle, write the new content to the target position
          const targetPath = allSlideImportPaths[insertAtIndex]
          const targetFileContent = await readSlideFile(targetPath)
          const updatedTargetContent = await replaceSlideContent(
            targetFileContent,
            content || '', // Use empty content if none provided
          )

          await writeSlideFile(targetPath, updatedTargetContent)
        }

        channel.emit(EVENTS.INSERT_SLIDE_RESPONSE, {
          id,
          success: true,
          error: null,
          payload: {
            newImportPath,
          },
        } satisfies ResponseData<InsertSlideResponsePayload>)
      } catch (error: unknown) {
        channel.emit(EVENTS.INSERT_SLIDE_RESPONSE, {
          id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        } satisfies ResponseData<InsertSlideResponsePayload>)

        logger.error(
          `Error inserting slide at index ${insertAtIndex}:\n${error instanceof Error ? error.stack || error.message || error.toString() : error}`,
        )
      }
    },
  )
}
