/**
 * Process a drop result
 * This is where you would implement the actual slide reordering logic
 */
export function handleDrop(
  sourceStoryId: string,
  targetDropZoneId: string,
): void {
  console.log('Processing drop:', { sourceStoryId, targetDropZoneId })

  // Parse the target drop zone ID to determine if it's "before" or "after"
  const isBeforeDrop = targetDropZoneId.startsWith('before-')
  const targetStoryId = targetDropZoneId.replace(/(before-|after-)/, '')

  console.log('Drop details:', {
    sourceStoryId,
    targetStoryId,
    position: isBeforeDrop ? 'before' : 'after',
  })

  // Here you would call your actual reordering logic
  // For example:
  // if (isBeforeDrop) {
  //   moveSlideBeforeTarget(sourceStoryId, targetStoryId);
  // } else {
  //   moveSlideAfterTarget(sourceStoryId, targetStoryId);
  // }
}

/**
 * Extract details from a drop zone ID
 */
export function parseDropZoneId(dropZoneId: string): {
  position: 'before' | 'after'
  storyId: string
} {
  const isBeforeDrop = dropZoneId.startsWith('before-')
  const storyId = dropZoneId.replace(/(before-|after-)/, '')

  return {
    position: isBeforeDrop ? 'before' : 'after',
    storyId,
  }
}
