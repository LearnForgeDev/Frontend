import { createPortal } from "react-dom";
import pluginsList from "../utils/toolbarButtons.ts";
import '../../../../styles/pages/Lessons/components/toolbar.css';
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import DefaultButton from "./ToolbarDefaultButton.tsx";
import Dropdown from "./ToolbarDropdown.tsx";
import formatText from "../utils/formattingActions.ts";
import {useCallback, useEffect, useState, useRef} from "react";
import { mergeRegister } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
} from "lexical";
import {$isLinkNode} from "@lexical/link";
import {$getNearestNodeOfType} from "@lexical/utils";
import {$isListNode, ListNode} from "@lexical/list";
import {$isHeadingNode} from "@lexical/rich-text";
import InsertImageModal from "./modals/InsertImageModal.tsx";
import FloatingLinkEditor from "./modals/FloatingLinkEditor.tsx";
import InsertVideoModal from "./modals/InsertVideoModal.tsx";
import KatexEquationModal from "./modals/KatexEquationModal.tsx";
import {INSERT_EQUATION_COMMAND} from "../plugins/EquationsPlugin.tsx";
import getSelectedNode from "../utils/getSelectedNode.ts";

export default function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const plugins = pluginsList;

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] = useState("paragraph");
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);

  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isEquationModalOpen, setIsEquationModalOpen] = useState(false);

  const [isFloating, setIsFloating] = useState(false);

  const handlePluginClick = (event: string) => {
    formatText(
      editor,
      event,
      blockType,
      () => setIsImageModalOpen(true),
      () => setIsVideoModalOpen(true),
      () => setIsEquationModalOpen(true),
    );
  }

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if (!$isRangeSelection(selection)) return;

    const anchorNode = selection.anchor.getNode();
    const element =
      anchorNode.getKey() === "root"
        ? anchorNode
        : anchorNode.getTopLevelElementOrThrow();
    const elementKey = element.getKey();
    const elementDOM = editor.getElementByKey(elementKey);

    setIsBold(selection.hasFormat("bold"));
    setIsItalic(selection.hasFormat("italic"));
    setIsUnderline(selection.hasFormat("underline"));
    setIsStrikethrough(selection.hasFormat("strikethrough"));
    setIsCode(selection.hasFormat("code"));

    const node = getSelectedNode(selection);
    const parent = node.getParent();
    if ($isLinkNode(parent) || $isLinkNode(node)) {
      setIsLink(true);
    } else {
      setIsLink(false);
    }

    if (elementDOM !== null) {
      if ($isListNode(element)) {
        const parentList = $getNearestNodeOfType(anchorNode, ListNode);
        const type = parentList ? parentList.getListType() : element.getListType();
        setBlockType(type);
      } else {
        const type = $isHeadingNode(element)
          ? element.getTag()
          : element.getType();
        setBlockType(type);
      }
    }

    const elementAlignNum = element.getFormat();
    const alignMap = ['left', '', 'center', 'right', 'justify'] as const;
    setAlignment(alignMap[elementAlignNum] || 'left');

  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({editorState}) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateToolbar();
          return false;
        },
        1
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        1
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        1
      )
    );
  }, [editor, updateToolbar]);

  useEffect(() => {
    const target = sentinelRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsFloating(!entry.isIntersecting),
      { threshold: 0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/*BUTTONS*/}
      <div ref={sentinelRef} className="toolbar-sentinel" aria-hidden />
      {/*TODO fix buttons wrapping*/}
      <div ref={toolbarRef} className={`toolbar ${isFloating ? 'floating' : ''}`}>
        <DefaultButton button={plugins.formatUndo} action={handlePluginClick} disabled={!canUndo}/>
        <DefaultButton button={plugins.formatRedo} action={handlePluginClick} disabled={!canRedo}/>
        <Dropdown
          buttons={[plugins.paragraph,
                    plugins.h1,
                    plugins.h2,
                    plugins.quote]}
          action={handlePluginClick}
          value={blockType}
        />
        <DefaultButton button={plugins.ul} action={handlePluginClick} active={blockType === "bullet"}/>
        <DefaultButton button={plugins.ol} action={handlePluginClick} active={blockType === "number"}/>
        <DefaultButton button={plugins.formatCode} action={handlePluginClick} active={isCode}/>
        <DefaultButton button={plugins.formatBold} action={handlePluginClick} active={isBold}/>
        <DefaultButton button={plugins.formatItalic} action={handlePluginClick} active={isItalic}/>
        <DefaultButton button={plugins.formatUnderline} action={handlePluginClick} active={isUnderline}/>
        <DefaultButton button={plugins.formatStrike} action={handlePluginClick} active={isStrikethrough}/>
        <DefaultButton button={plugins.formatInsertLink} action={handlePluginClick} active={isLink} />
        <Dropdown
          buttons={[plugins.formatAlignLeft,
                    plugins.formatAlignCenter,
                    plugins.formatAlignRight,
                    plugins.formatAlignJustify]}
          action={handlePluginClick}
          value={alignment}
        />
        <DefaultButton button={plugins.insertImage} action={handlePluginClick}/>
        <DefaultButton button={plugins.insertVideo} action={handlePluginClick} />
        <DefaultButton button={plugins.insertGraphic} action={handlePluginClick} />
        <DefaultButton button={plugins.insertEquation} action={handlePluginClick} />
      </div>

      {/*MODALS*/}
      {isImageModalOpen && createPortal(
        <InsertImageModal
          onClose={() => setIsImageModalOpen(false)}
        />,
        document.body
      )}
      {isLink && createPortal(
        <FloatingLinkEditor editor={editor} />,
        document.body
      )}
      {isVideoModalOpen && createPortal(
        <InsertVideoModal
          onClose={() => setIsVideoModalOpen(false)}
          editor={editor}
        />,
        document.body
      )}
      {isEquationModalOpen && createPortal(
        <KatexEquationModal
          onConfirm={
          (equation, inline) =>
            editor.dispatchCommand(INSERT_EQUATION_COMMAND, {equation, inline})}
          onClose={() => setIsEquationModalOpen(false)}
        />,
        document.body
      ) }
    </>
  )
}
