import React, { useEffect } from 'react'
import type { API_HashEntry } from 'storybook/internal/types'
import { EditIcon, MenuIcon } from '@storybook/icons'

import { isSlide } from '../isSlide'
import { DragState } from '../constants'
import { Button } from '../components/Button'
import { ADDON_ID } from '../constants'
import { handleDrop } from './dragDrop'

import './sidebar.css'

// Simple utility to get coordinates from drag event
const getCoordinates = (event: DragEvent) => {
  return {
    x: event.clientX,
    y: event.clientY,
  }
}

// Helper to check if an element is within a drop zone
const isWithinDropZone = (event: DragEvent, dropZoneElement: HTMLElement) => {
  if (!dropZoneElement) return false

  const { x, y } = getCoordinates(event)
  const rect = dropZoneElement.getBoundingClientRect()

  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
}

// Interface for the API parameter
interface StorybookAPI {
  getAddonState: (addonId: string) => DragState | undefined
  setAddonState: (addonId: string, state: DragState) => void
}

const DragEventListener = ({
  api,
  root,
}: {
  api: StorybookAPI
  root: API_HashEntry
}) => {
  useEffect(() => {
    // Handle dragover events - this is critical for drag and drop to work
    const handleDragOver = (event: DragEvent) => {
      // Prevent default to allow drop
      event.preventDefault()

      const state = api.getAddonState(ADDON_ID) || {
        isDragging: false,
        draggedStoryId: null,
        activeDropZoneId: null,
      }
      const { isDragging, draggedStoryId, activeDropZoneId } = state

      if (!isDragging || !draggedStoryId) {
        return
      }

      // Get all drop zones on the page
      const dropZones = document.querySelectorAll('.sidebar-drop-area')
      let activeZone = null

      // Check if the cursor is over any drop zone
      dropZones.forEach((zone) => {
        if (isWithinDropZone(event, zone as HTMLElement)) {
          activeZone = zone.getAttribute('data-drop-zone-id')
        }
      })

      // Update the active drop zone in the addon state
      if (activeZone !== activeDropZoneId) {
        api.setAddonState(ADDON_ID, {
          isDragging: true,
          draggedStoryId: draggedStoryId,
          activeDropZoneId: activeZone,
          previewElementId: state.previewElementId,
        })
      }
    }

    // Global drag enter handler - needed for some browsers
    const handleDragEnter = (event: DragEvent) => {
      event.preventDefault()
    }

    // Global drag leave handler
    const handleDragLeave = (event: DragEvent) => {
      // Do nothing, just prevent default
      event.preventDefault()
    }

    // This is critical for drag and drop to work!
    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('dragenter', handleDragEnter)
    document.addEventListener('dragleave', handleDragLeave)

    return () => {
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('dragenter', handleDragEnter)
      document.removeEventListener('dragleave', handleDragLeave)
    }
  }, [api])

  return root.name
}

export function renderLabel(item: API_HashEntry, api: StorybookAPI) {
  // Disabled for now.
  // return

  const {
    isDragging = false,
    draggedStoryId = null,
    activeDropZoneId = null,
  } = api.getAddonState(ADDON_ID) ?? {}

  console.log('state check:', item.id, draggedStoryId)

  if (item.type === 'root') {
    return <DragEventListener api={api} root={item} />
  }

  if (isSlide(item.id) && item.type === 'docs') {
    const isFirstSlide = item.id.endsWith('-1--docs')
    // Skip rendering drop zones for the item being dragged
    const isBeingDragged = draggedStoryId === item.id

    // Create unique IDs for drop zones
    const beforeDropZoneId = `before-${item.id}`
    const afterDropZoneId = `after-${item.id}`

    return (
      <span className="sidebar-item">
        <span className="sidebar-item-title">{item.title}</span>
        <Button
          ariaLabel="Move slide"
          icon={MenuIcon}
          variant="secondary"
          className="sidebar-button"
          draggable={true}
          data-story-id={item.id}
          onClick={(e: React.MouseEvent) => e.preventDefault()}
          onDragStart={(e: React.DragEvent) => {
            // Log which item is being dragged
            console.log('Drag started for item:', item.id)

            // CRITICAL: Set data on the dataTransfer object to make the drag operation valid
            // Without this, some browsers will cancel the drag immediately
            e.dataTransfer.setData('text/plain', item.id)

            // Set effectAllowed to make it clear this is a move operation
            e.dataTransfer.effectAllowed = 'move'

            // Make sure drag operation isn't cancelled
            // setTimeout(() => {
            //   console.log('Making sure drag operation is maintained')
            //   if (!api.getAddonState(ADDON_ID)?.isDragging) {
            //     // If state somehow got reset, let's set it again
            //     api.setAddonState(ADDON_ID, {
            //       isDragging: true,
            //       draggedStoryId: item.id,
            //       activeDropZoneId: null,
            //       previewElementId: null,
            //     })
            //   }
            // }, 100)

            // Reference to the preview element to clean up later
            const previewId = `drag-preview-${Date.now()}`

            // Set the drag image with better styling
            const dragPreview = document.createElement('div')
            dragPreview.id = previewId
            dragPreview.textContent = `Moving: ${item.title}`
            dragPreview.style.padding = '8px'
            dragPreview.style.background = 'white'
            dragPreview.style.border = '1px solid #ccc'
            dragPreview.style.borderRadius = '4px'
            dragPreview.style.position = 'fixed' // Use fixed instead of absolute
            dragPreview.style.zIndex = '9999'
            dragPreview.style.opacity = '0.9'
            // Position offscreen but still in the document
            dragPreview.style.top = '-1000px'
            dragPreview.style.left = '-1000px'

            // Add to document body
            document.body.appendChild(dragPreview)

            try {
              // Set the drag image
              e.dataTransfer.setDragImage(dragPreview, 0, 0)
            } catch (err) {
              console.error('Error setting drag image:', err)
            }

            // Store the dragged item ID and preview element ID for cleanup later
            console.log('Setting addon state w/draggedStoryId:', item.id)
            setTimeout(() => {
              api.setAddonState(ADDON_ID, {
                isDragging: true,
                draggedStoryId: item.id,
                activeDropZoneId: null,
                previewElementId: previewId, // Store the preview element ID
              })
            }, 0)
            // Important: We're NOT removing the preview element immediately
            // It will be cleaned up in onDragEnd

            // Make sure drag-related DOM events are triggered
            e.stopPropagation()
          }}
          onDragEnd={(e: React.DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            console.log('Drag ended for item:', item.id)

            const state = api.getAddonState(ADDON_ID)

            // Clean up the preview element if it exists
            if (state?.previewElementId) {
              const previewElement = document.getElementById(
                state.previewElementId,
              )
              if (previewElement && previewElement.parentNode) {
                console.log('Cleaning up drag preview')
                previewElement.parentNode.removeChild(previewElement)
              }
            }

            const dropResult = {
              sourceStoryId: state?.draggedStoryId,
              targetDropZoneId: state?.activeDropZoneId,
            }

            // Handle the drop if it was successful
            if (state?.activeDropZoneId) {
              console.log('Drop result:', dropResult)

              // Process the drop with our utility function
              if (dropResult.sourceStoryId && dropResult.targetDropZoneId) {
                handleDrop(
                  dropResult.sourceStoryId,
                  dropResult.targetDropZoneId,
                )
              }
            }

            // Reset drag state
            api.setAddonState(ADDON_ID, {
              isDragging: false,
              draggedStoryId: null,
              activeDropZoneId: null,
              previewElementId: null,
            })
          }}
        />
        <Button
          ariaLabel="Edit slide"
          icon={EditIcon}
          variant="secondary"
          className="sidebar-button"
          onClick={(e: React.MouseEvent) => {
            e.preventDefault()
            console.log('TODO navigate and start with editor open')
          }}
        />
        {isDragging && !isBeingDragged && isFirstSlide && (
          <span
            className={`sidebar-drop-area side-drop-above ${activeDropZoneId === beforeDropZoneId ? 'active-drop-zone' : ''}`}
            data-drop-zone-id={beforeDropZoneId}
            onDragEnter={(e) => e.preventDefault()}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
            }}
            onDrop={(e) => {
              e.preventDefault()
              const result = {
                sourceStoryId: draggedStoryId,
                targetDropZoneId: beforeDropZoneId,
              }

              // Update addon state to ensure onDragEnd handler sees the correct drop zone
              api.setAddonState(ADDON_ID, {
                isDragging,
                draggedStoryId,
                activeDropZoneId: beforeDropZoneId,
              })

              console.log('Dropped above:', result)
            }}
          >
            above {item.id}
          </span>
        )}
        {isDragging && !isBeingDragged && (
          <span
            className={`sidebar-drop-area ${activeDropZoneId === afterDropZoneId ? 'active-drop-zone' : ''}`}
            data-drop-zone-id={afterDropZoneId}
            onDragEnter={(e) => e.preventDefault()}
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
            }}
            onDrop={(e) => {
              e.preventDefault()
              const result = {
                sourceStoryId: draggedStoryId,
                targetDropZoneId: afterDropZoneId,
              }

              // Update addon state to ensure onDragEnd handler sees the correct drop zone
              api.setAddonState(ADDON_ID, {
                isDragging,
                draggedStoryId,
                activeDropZoneId: afterDropZoneId,
              })

              console.log('Dropped below:', result)
            }}
          >
            below {item.id}
          </span>
        )}
      </span>
    )
  }
}
