import type { UseResizableOptions } from './useResizable.type';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { useCallback, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export function useResizable({
  nodeKey,
  width,
  height,
  elementRef,
  resizeCommand,
  maintainAspectRatio = true,
  minWidth = 50,
  minHeight = 50,
}: UseResizableOptions) {
  const [editor] = useLexicalComposerContext();
  const [isResizing, setIsResizing] = useState(false);
  const [size, setSize] = useState({ width, height, sourceWidth: width, sourceHeight: height });
  if (size.sourceWidth !== width || size.sourceHeight !== height) {
    setSize({ width, height, sourceWidth: width, sourceHeight: height });
  }
  const currentWidth = size.width;
  const currentHeight = size.height;

  const handleResizeStart = useCallback(
    (e: ReactMouseEvent, direction: string) => {
      e.preventDefault();
      e.stopPropagation();
      setIsResizing(true);

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = currentWidth || elementRef.current?.offsetWidth || 200;
      const startHeight = currentHeight || elementRef.current?.offsetHeight || 200;
      const aspectRatio = startWidth / startHeight;

      let newWidth = startWidth;
      let newHeight = startHeight;

      const onMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const deltaY = moveEvent.clientY - startY;

        newWidth = startWidth;
        newHeight = startHeight;

        if (direction.includes("e")) {
          newWidth = Math.max(minWidth, startWidth + deltaX);
        }
        if (direction.includes("w")) {
          newWidth = Math.max(minWidth, startWidth - deltaX);
        }
        if (direction.includes("s")) {
          newHeight = Math.max(minHeight, startHeight + deltaY);
        }
        if (direction.includes("n")) {
          newHeight = Math.max(minHeight, startHeight - deltaY);
        }

        // Maintain aspect ratio for corner handles
        if (maintainAspectRatio && direction.length === 2) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            newHeight = newWidth / aspectRatio;
          } else {
            newWidth = newHeight * aspectRatio;
          }
        }

        setSize({ width: Math.round(newWidth), height: Math.round(newHeight), sourceWidth: width, sourceHeight: height });
      };

      const onMouseUp = () => {
        setIsResizing(false);
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);

        // Dispatch resize command so it can be undone
        editor.dispatchCommand(resizeCommand, {
          nodeKey,
          width: Math.round(newWidth),
          height: Math.round(newHeight),
        });
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    },
    [
      currentWidth,
      currentHeight,
      editor,
      nodeKey,
      elementRef,
      resizeCommand,
      maintainAspectRatio,
      minWidth,
      minHeight,
      width,
      height,
    ]
  );

  return {
    isResizing,
    currentWidth,
    currentHeight,
    handleResizeStart,
  };
}
