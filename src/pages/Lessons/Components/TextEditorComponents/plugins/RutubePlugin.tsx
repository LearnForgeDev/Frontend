import type {JSX} from 'react';

import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {$insertNodeToNearestRoot} from '@lexical/utils';
import {COMMAND_PRIORITY_EDITOR, createCommand, type LexicalCommand} from 'lexical';
import {useEffect} from 'react';

import {$createRutubeNode, RutubeNode} from '../nodes/RutubeNode.tsx';

export const INSERT_RUTUBE_COMMAND: LexicalCommand<string> = createCommand(
  'INSERT_RUTUBE_COMMAND',
);

export default function RutubePlugin(): JSX.Element | null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!editor.hasNodes([RutubeNode])) {
      throw new Error('RutubePlugin: RutubeNode not registered on editor');
    }

    return editor.registerCommand<string>(
      INSERT_RUTUBE_COMMAND,
      (payload) => {
        const rutubeNode = $createRutubeNode(payload);
        $insertNodeToNearestRoot(rutubeNode);

        return true;
      },
      COMMAND_PRIORITY_EDITOR,
    );
  }, [editor]);

  return null;
}

