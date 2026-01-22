/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {JSX} from 'react';

import {LinkPlugin as LexicalLinkPlugin} from '@lexical/react/LexicalLinkPlugin';
import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {useEffect} from 'react';

import {validateUrl} from '../utils/url.ts';

type Props = {
  hasLinkAttributes?: boolean;
};

export default function LinkPlugin({
                                     hasLinkAttributes = false,
                                   }: Props): JSX.Element {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const linkElement = target.closest('a.editor-link');

      if (linkElement && linkElement instanceof HTMLAnchorElement) {
        const href = linkElement.getAttribute('href');
        if (href) {
          event.preventDefault();
          window.open(href, '_blank', 'noopener,noreferrer');
        }
      }
    };

    const editorElement = editor.getRootElement();
    if (editorElement) {
      editorElement.addEventListener('click', handleClick);
      return () => {
        editorElement.removeEventListener('click', handleClick);
      };
    }
  }, [editor]);

  return (
    <LexicalLinkPlugin
      validateUrl={validateUrl}
      attributes={
        hasLinkAttributes
          ? {
            rel: 'noopener noreferrer',
            target: '_blank',
          }
          : undefined
      }
    />
  );
}
