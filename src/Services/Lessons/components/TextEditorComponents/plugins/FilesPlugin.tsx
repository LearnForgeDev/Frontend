import type {JSX} from 'react';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {
  $wrapNodeInElement,
  mergeRegister,
} from '@lexical/utils';
import {
  $createParagraphNode,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  type LexicalCommand,
} from 'lexical';
import {useEffect} from 'react';
import {
  $createFileNode,
  FileNode, type FilePayload,
} from '../nodes/FileNode.tsx';

export type InsertFilePayload = Readonly<FilePayload>;

export const INSERT_FILE_COMMAND: LexicalCommand<InsertFilePayload> =
  createCommand('INSERT_FILE_COMMAND');

export default function FilesPlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([FileNode])) {
      throw new Error('FilesPlugin: FileNode not registered on editor');
    }

    return mergeRegister(
      editor.registerCommand<InsertFilePayload>(
        INSERT_FILE_COMMAND,
        (payload) => {
          const fileNode = $createFileNode(payload);
          $insertNodes([fileNode]);
          if ($isRootOrShadowRoot(fileNode.getParentOrThrow())) {
            $wrapNodeInElement(fileNode, $createParagraphNode).selectEnd();
          }

          return true;
        },
        COMMAND_PRIORITY_EDITOR,
      )
    );
  }, [editor]);

  return null;
}
