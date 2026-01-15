import {
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  type LexicalEditor,
  type TextFormatType,
  type ElementFormatType,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
} from "lexical";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
} from "@lexical/list";
import {
  $createHeadingNode,
  $createQuoteNode,
} from "@lexical/rich-text";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { $wrapNodes } from "@lexical/selection";
import {$createGraphNode} from "../nodes/graphNode.tsx";
import { $insertNodes } from "lexical";

export default function formatText(
  editor: LexicalEditor,
  event: string,
  onOpenImageModal: () => void,
  onOpenVideoModal: () => void,
  onOpenEquationModal: () => void,
) {
  const insertLink = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
  };

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createParagraphNode());
      }
    });
  };

  const formatLargeHeading = () => {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createHeadingNode("h1"));
      }
    });
  };

  const formatSmallHeading = () => {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createHeadingNode("h2"));
      }
    });
  };

  const formatBulletList = () => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  };

  const formatNumberedList = () => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  };

  const formatQuote = () => {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        $wrapNodes(selection, () => $createQuoteNode());
      }
    });
  };

  const insertImage = () => {
    if (onOpenImageModal) onOpenImageModal();
  }

  const insertGraphic = () => {
    editor.update(() => {
      const selection = $getSelection();

      if ($isRangeSelection(selection)) {
        const graphNode = $createGraphNode();
        $insertNodes([graphNode]);
      }
    });
  }

  const insertVideo = () => {
    if (onOpenVideoModal) onOpenVideoModal();
  }

  const insertEquation = () => {
    if (onOpenEquationModal) onOpenEquationModal();
  }

  const formatTextCommands = new Set(["bold", "underline", "strikethrough",
    "italic", "highlight", "code", "subscript",
    "superscript", "lowercase", "uppercase", "capitalize"]);
  const alignCommands = new Set(['left', 'right', 'center', 'start', 'end', 'justify']);

  const commandHandlers: Record<string, () => void> = {
    undo: () => editor.dispatchCommand(UNDO_COMMAND, undefined),
    redo: () => editor.dispatchCommand(REDO_COMMAND, undefined),
    paragraph: formatParagraph,
    h1: formatLargeHeading,
    h2: formatSmallHeading,
    ul: formatBulletList,
    ol: formatNumberedList,
    quote: formatQuote,
    formatInsertLink: insertLink,
    insertImage,
    insertGraphic,
    insertVideo,
    insertEquation
  };

  const handler = commandHandlers[event];
  if (handler) {
    handler();
  } else if (formatTextCommands.has(event)) {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, event as TextFormatType);
  } else if (alignCommands.has(event)) {
    editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, event as ElementFormatType);
  }
}
