import { useEffect, useRef, useState, useCallback } from "react";
import {
  SELECTION_CHANGE_COMMAND,
  $getSelection,
  $isRangeSelection,
  type LexicalEditor,
  type RangeSelection,
} from "lexical";
import { mergeRegister } from "@lexical/utils";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $isAtNodeEnd } from "@lexical/selection";
import "../../../../../styles/pages/Lessons/components/modals/floatingLinkEditor.css";

const LowPriority = 1;

function getSelectedNode(selection: RangeSelection) {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
  }
}

function positionEditorElement(editorElem: HTMLDivElement, rect: DOMRect | null, editorInputRect: DOMRect | null) {
  if (rect === null || editorInputRect === null) {
    editorElem.style.opacity = "0";
    editorElem.style.top = "-1000px";
    editorElem.style.left = "-1000px";
  } else {
    editorElem.style.opacity = "1";
    editorElem.style.top = `${rect.top + rect.height + window.pageYOffset + 10}px`;

    if (Math.trunc(editorElem.getBoundingClientRect().right) > Math.trunc(editorInputRect.right)) {
      editorElem.style.left = `${
        editorInputRect.right - editorElem.getBoundingClientRect().width
      }px`;
    } else {
      editorElem.style.left = `${rect.left}px`;
    }
  //  FIXME: 10 - magic number
  //  FIXME: Positioning is slightly off when near the right edge of the editor
  }
}

interface FloatingLinkEditorProps {
  editor: LexicalEditor;
}

export default function FloatingLinkEditor({ editor }: FloatingLinkEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mouseDownRef = useRef(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isEditMode, setEditMode] = useState(false);
  const [lastSelection, setLastSelection] = useState<RangeSelection | null>(null);

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl("");
      }
    }
    const editorElem = editorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    const editorInputElement = document.querySelector('.editor-input') as HTMLElement;

    if (
      selection !== null &&
      nativeSelection !== null &&
      !nativeSelection.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection.anchorNode)
    ) {
      const domRange = nativeSelection.getRangeAt(0);
      let rect: DOMRect;
      if (nativeSelection.anchorNode === rootElement) {
        let inner: Element = rootElement;
        while (inner.firstElementChild != null) {
          inner = inner.firstElementChild;
        }
        rect = inner.getBoundingClientRect();
      } else {
        rect = domRange.getBoundingClientRect();
      }

      const editorInputRect = editorInputElement ? editorInputElement.getBoundingClientRect() : null;

      if (!mouseDownRef.current) {
        positionEditorElement(editorElem, rect, editorInputRect);
      }
      setLastSelection(selection as RangeSelection);
    } else if (!activeElement || activeElement.className !== "floating-link-input") {
      positionEditorElement(editorElem, null, null);
      setLastSelection(null);
      setEditMode(false);
      setLinkUrl("");
    }

    return true;
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        LowPriority
      )
    );
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  const handleLinkSubmit = () => {
    if (lastSelection !== null) {
      if (linkUrl !== "") {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
      } else {
        editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
      }
      setEditMode(false);
    }
  };

  return (
    <div className="floating-link-editor" ref={editorRef}>
      <div className="floating-link-content">
        {isEditMode ? (
          <input
            ref={inputRef}
            className="floating-link-input"
            value={linkUrl}
            onChange={(event) => {
              setLinkUrl(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleLinkSubmit();
              } else if (event.key === "Escape") {
                event.preventDefault();
                setEditMode(false);
              }
            }}
            placeholder="Введите URL..."
          />
        ) : (
          <a
            className="floating-link-url"
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {linkUrl || "Нет ссылки"}
          </a>
        )}
        <button
          className="floating-link-edit-btn"
          type="button"
          tabIndex={0}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            if (isEditMode) {
              handleLinkSubmit();
            } else {
              setEditMode(true);
            }
          }}
        >
          {isEditMode ? "✓" : "✎"}
        </button>
      </div>
    </div>
  );
}
