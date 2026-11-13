import { RESIZE_IMAGE_COMMAND } from '@/Services/Lessons/imageCommands.const';
import type { ImageComponentProps } from './ImageComponent.type';
import type { CSSProperties } from 'react';
import { useRef, useCallback, useEffect, type JSX } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { mergeRegister } from '@lexical/utils';
import { $getNodeByKey, $getSelection, $isNodeSelection, CLICK_COMMAND, COMMAND_PRIORITY_LOW, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND } from "lexical";
import { $isImageNode } from './ImageNode.tsx';
import { useResizable } from '@/Assets/Hooks/useResizable';

export default function ImageComponent({
  src,
  altText,
  width,
  height,
  nodeKey,
  float,
}: ImageComponentProps): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const imageRef = useRef<HTMLImageElement>(null);
  const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);

  const { isResizing, currentWidth, currentHeight, handleResizeStart } = useResizable({
    nodeKey,
    width,
    height,
    elementRef: imageRef,
    resizeCommand: RESIZE_IMAGE_COMMAND,
    maintainAspectRatio: true,
  });

  const onDelete = useCallback(
    (event: KeyboardEvent) => {
      if (isSelected && $isNodeSelection($getSelection())) {
        event.preventDefault();
        editor.update(() => {
          const node = $getNodeByKey(nodeKey);
          if ($isImageNode(node)) {
            node.remove();
          }
        });
      }
      return false;
    },
    [editor, isSelected, nodeKey]
  );

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        (event) => {
          if (imageRef.current && imageRef.current.contains(event.target as Node)) {
            if (!event.shiftKey) {
              clearSelection();
            }
            setSelected(true);
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_DELETE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW
      ),
      editor.registerCommand(
        KEY_BACKSPACE_COMMAND,
        onDelete,
        COMMAND_PRIORITY_LOW
      )
    );
  }, [clearSelection, editor, onDelete, setSelected]);

  const style: CSSProperties = {
    width: currentWidth ? `${currentWidth}px` : undefined,
    height: currentHeight ? `${currentHeight}px` : undefined,
    maxWidth: "100%",
  };

  return (
    <div
      className={`image-wrapper ${isSelected ? "selected" : ""} ${isResizing ? "resizing" : ""}`}
      draggable={!isResizing}
      style={{
        float:
          float === 'center' || float === undefined
            ? 'none'
            : float
    }}
    >
      <img
        ref={imageRef}
        src={src}
        alt={altText}
        style={style}
        draggable="false"
      />
      {isSelected && (
        <>
          <div
            className="resize-handle nw"
            onMouseDown={(e) => handleResizeStart(e, "nw")}
          />
          <div
            className="resize-handle ne"
            onMouseDown={(e) => handleResizeStart(e, "ne")}
          />
          <div
            className="resize-handle sw"
            onMouseDown={(e) => handleResizeStart(e, "sw")}
          />
          <div
            className="resize-handle se"
            onMouseDown={(e) => handleResizeStart(e, "se")}
          />
          <div
            className="resize-handle n"
            onMouseDown={(e) => handleResizeStart(e, "n")}
          />
          <div
            className="resize-handle s"
            onMouseDown={(e) => handleResizeStart(e, "s")}
          />
          <div
            className="resize-handle e"
            onMouseDown={(e) => handleResizeStart(e, "e")}
          />
          <div
            className="resize-handle w"
            onMouseDown={(e) => handleResizeStart(e, "w")}
          />
        </>
      )}
    </div>
  );
}
