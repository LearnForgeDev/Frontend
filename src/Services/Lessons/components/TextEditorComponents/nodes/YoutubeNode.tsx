import YouTubePlayer from '@/Services/Lessons/components/YouTubePlayer/YouTubePlayer';
import type { SerializedYouTubeNode } from './YoutubeNode.type';
export type { SerializedYouTubeNode } from './YoutubeNode.type';
/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { DOMConversionMap, DOMConversionOutput, DOMExportOutput, EditorConfig, LexicalEditor, LexicalNode, NodeKey } from 'lexical';
import type { JSX } from 'react';

import { DecoratorNode } from 'lexical';



function $convertYoutubeElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const videoID = domNode.getAttribute('data-lexical-youtube');
  if (videoID) {
    const node = $createYouTubeNode(videoID);
    return {node};
  }
  return null;
}

export class YouTubeNode extends DecoratorNode<JSX.Element> {
  __id: string;

  static override getType(): string {
    return 'youtube';
  }

  static override clone(node: YouTubeNode): YouTubeNode {
    return new YouTubeNode(node.__id, node.__key);
  }

  static override importJSON(serializedNode: SerializedYouTubeNode): YouTubeNode {
    return $createYouTubeNode(serializedNode.videoID);
  }

  override exportJSON(): SerializedYouTubeNode {
    return {
      type: 'youtube',
      version: 1,
      videoID: this.__id,
    };
  }

  constructor(id: string, key?: NodeKey) {
    super(key);
    this.__id = id;
  }

  override createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement('span');
    const className = config.theme.youtube;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  override updateDOM(): false {
    return false;
  }

  override exportDOM(): DOMExportOutput {
    const element = document.createElement('iframe');
    element.setAttribute('data-lexical-youtube', this.__id);
    element.setAttribute('width', '560');
    element.setAttribute('height', '315');
    element.setAttribute(
      'src',
      `https://www.youtube-nocookie.com/embed/${this.__id}`,
    );
    element.setAttribute('frameborder', '0');
    element.setAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture',
    );
    element.setAttribute('allowfullscreen', 'true');
    element.setAttribute('title', 'YouTube video');
    return {element};
  }

  static override importDOM(): DOMConversionMap | null {
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-youtube')) {
          return null;
        }
        return {
          conversion: $convertYoutubeElement,
          priority: 1,
        };
      },
    };
  }

  getId(): string {
    return this.__id;
  }

  override getTextContent(): string {
    return `https://www.youtube.com/watch?v=${this.__id}`;
  }

  override decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {};
    const className = embedBlockTheme.base || '';
    return (
      <YouTubePlayer
        className={className}
        nodeKey={this.getKey()}
        videoID={this.__id}
      />
    );
  }
}

export function $createYouTubeNode(videoID: string): YouTubeNode {
  return new YouTubeNode(videoID);
}

export function $isYouTubeNode(
  node: YouTubeNode | LexicalNode | null | undefined,
): node is YouTubeNode {
  return node instanceof YouTubeNode;
}