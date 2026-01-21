import { useCallback, useState, useEffect, type RefObject } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import type { LexicalCommand, NodeKey } from "lexical";

interface UseResizableOptions {
  nodeKey: NodeKey;
  width?: number;
  height?: number;
  elementRef: RefObject<HTMLElement>;
  resizeCommand: LexicalCommand<{
    nodeKey: NodeKey;
    width: number;
    height: number;
  }>;
  maintainAspectRatio?: boolean;
  minWidth?: number;
  minHeight?: number;
}

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
  const [currentWidth, setCurrentWidth] = useState(width);
  const [currentHeight, setCurrentHeight] = useState(height);

  const handleResizeStart = useCallback(
    (e: React.MouseEvent, direction: string) => {
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

        setCurrentWidth(Math.round(newWidth));
        setCurrentHeight(Math.round(newHeight));
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
    ]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentWidth(width);
    setCurrentHeight(height);
  }, [width, height]);

  return {
    isResizing,
    currentWidth,
    currentHeight,
    handleResizeStart,
  };
}

