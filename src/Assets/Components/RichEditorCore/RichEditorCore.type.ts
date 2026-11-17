import type { ReactNode } from 'react';
import type { InitialConfigType } from '@lexical/react/LexicalComposer';

export interface RichEditorCoreProps {
  configuration: InitialConfigType;
  editable: boolean;
  label: string;
  className?: string;
  testId?: string;
  autoFocus?: boolean;
  toolbar?: ReactNode;
  children?: ReactNode;
}
