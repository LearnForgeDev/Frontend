import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import type { RichEditorCoreProps } from './RichEditorCore.type';

export default function RichEditorCore({
  configuration, editable, label, className, testId, autoFocus = false, toolbar, children,
}: RichEditorCoreProps) {
  return <LexicalComposer initialConfig={{ ...configuration, editable }}>
    {editable && toolbar}
    <RichTextPlugin
      contentEditable={<ContentEditable aria-label={label} aria-readonly={!editable} data-testid={testId} className={className} />}
      ErrorBoundary={LexicalErrorBoundary}
    />
    {editable && autoFocus && <AutoFocusPlugin />}
    <HistoryPlugin />
    <ListPlugin />
    {children}
  </LexicalComposer>;
}
