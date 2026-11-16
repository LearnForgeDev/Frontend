import { useEffect, useState } from 'react';
import { Alert, Box, IconButton, Stack, Tooltip } from '@mui/material';
import FormatBoldIcon from '@mui/icons-material/FormatBold';
import FormatItalicIcon from '@mui/icons-material/FormatItalic';
import FormatUnderlinedIcon from '@mui/icons-material/FormatUnderlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import FormatListNumberedIcon from '@mui/icons-material/FormatListNumbered';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { $getRoot, FORMAT_TEXT_COMMAND, REDO_COMMAND, UNDO_COMMAND } from 'lexical';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import RichEditorCore from '../RichEditorCore/RichEditorCore';
import type { RichTextEditorProps } from './RichTextEditor.type';
import { richTextFromText } from './RichTextEditor.utils';

function RichTextControls() {
  const [editor] = useLexicalComposerContext();
  const actions = [
    { label: 'Полужирный', icon: <FormatBoldIcon />, run: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold') },
    { label: 'Курсив', icon: <FormatItalicIcon />, run: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic') },
    { label: 'Подчёркнутый', icon: <FormatUnderlinedIcon />, run: () => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline') },
    { label: 'Маркированный список', icon: <FormatListBulletedIcon />, run: () => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined) },
    { label: 'Нумерованный список', icon: <FormatListNumberedIcon />, run: () => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined) },
    { label: 'Отменить изменение', icon: <UndoIcon />, run: () => editor.dispatchCommand(UNDO_COMMAND, undefined) },
    { label: 'Повторить изменение', icon: <RedoIcon />, run: () => editor.dispatchCommand(REDO_COMMAND, undefined) },
  ];
  return <Stack direction="row" useFlexGap role="toolbar" aria-label="Форматирование текста" sx={{ flexWrap: 'wrap', borderBottom: 1, borderColor: 'divider', p: 0.5 }}>
    {actions.map(action => <Tooltip title={action.label} key={action.label}>
      <IconButton size="small" aria-label={action.label} onMouseDown={event => event.preventDefault()} onClick={() => action.run()}>
        {action.icon}
      </IconButton>
    </Tooltip>)}
  </Stack>;
}

function RichTextState({ value, readOnly = false }: Pick<RichTextEditorProps, 'value' | 'readOnly'>) {
  const [editor] = useLexicalComposerContext();
  useEffect(() => {
    editor.setEditable(!readOnly);
    const incoming = editor.parseEditorState((value ?? richTextFromText('')).state);
    if (JSON.stringify(incoming.toJSON()) !== JSON.stringify(editor.getEditorState().toJSON())) {
      editor.setEditorState(incoming, { tag: 'external-value' });
    }
  }, [editor, readOnly, value]);
  return null;
}

export default function RichTextEditor({ value, onChange, readOnly = false, label }: RichTextEditorProps) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <Alert severity="error">Не удалось прочитать текст. Сохранённое содержимое не изменено.</Alert>;
  }
  return <Box sx={{ border: readOnly ? 0 : 1, borderColor: 'divider', borderRadius: readOnly ? 0 : 2, overflow: readOnly ? 'visible' : 'hidden', '& .rich-text-input': { p: readOnly ? 0 : 1.5, minHeight: readOnly ? 0 : 112, outline: 'none', overflowWrap: 'anywhere', '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 }, '& p': { m: 0, minHeight: '1.5em' }, '& strong': { fontWeight: 700 }, '& em': { fontStyle: 'italic' }, '& .text-underline': { textDecoration: 'underline' } } }}>
    <RichEditorCore
      configuration={{ namespace: 'HomeworkRichText', nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode, AutoLinkNode, CodeNode, CodeHighlightNode], theme: { text: { bold: 'text-bold', italic: 'text-italic', underline: 'text-underline' } }, editorState: value ? JSON.stringify(value.state) : undefined, onError: () => setFailed(true) }}
      editable={!readOnly}
      label={label}
      className="rich-text-input"
      toolbar={<RichTextControls />}
    >
      <RichTextState value={value} readOnly={readOnly} />
      {!readOnly && onChange && <OnChangePlugin ignoreSelectionChange onChange={(state, editor, tags) => {
        if (!editor.isEditable() || tags.has('external-value')) {
          return;
        }
        const controlled = editor.parseEditorState((value ?? richTextFromText('')).state);
        if (JSON.stringify(state.toJSON()) === JSON.stringify(controlled.toJSON())) {
          return;
        }
        const text = state.read(() => $getRoot().getTextContent());
        onChange({ format: 'lexical', version: 1, state: state.toJSON() }, text);
      }} />}
    </RichEditorCore>
  </Box>;
}
