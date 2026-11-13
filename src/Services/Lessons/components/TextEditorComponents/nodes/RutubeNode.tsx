import RutubePlayer from '@/Services/Lessons/components/RutubePlayer/RutubePlayer';
import type { SerializedRutubeNode } from './RutubeNode.type';
export type { SerializedRutubeNode } from './RutubeNode.type';
import type { DOMConversionMap, DOMConversionOutput, DOMExportOutput, EditorConfig, ElementFormatType, LexicalEditor, LexicalNode, NodeKey } from 'lexical';
import type { JSX } from 'react';

import { DecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode';



function $convertRutubeElement(
  domNode: HTMLElement,
): null | DOMConversionOutput {
  const videoID = domNode.getAttribute('data-lexical-rutube');
  if (videoID) {
    const node = $createRutubeNode(videoID);
    return {node};
  }
  return null;
}

export class RutubeNode extends DecoratorBlockNode {
  __id: string;

  static override getType(): string {
    return 'rutube';
  }

  static override clone(node: RutubeNode): RutubeNode {
    return new RutubeNode(node.__id, node.__format, node.__key);
  }

  static override importJSON(serializedNode: SerializedRutubeNode): RutubeNode {
    return $createRutubeNode(serializedNode.videoID).updateFromJSON(
      serializedNode,
    );
  }

  override exportJSON(): SerializedRutubeNode {
    return {
      ...super.exportJSON(),
      videoID: this.__id,
    };
  }

  constructor(id: string, format?: ElementFormatType, key?: NodeKey) {
    super(format, key);
    this.__id = id;
  }

  override exportDOM(): DOMExportOutput {
    const element = document.createElement('iframe');
    element.setAttribute('data-lexical-rutube', this.__id);
    element.setAttribute('width', '560');
    element.setAttribute('height', '315');
    element.setAttribute(
      'src',
      `https://rutube.ru/play/embed/${this.__id}/`,
    );
    element.setAttribute('frameborder', '0');
    element.setAttribute(
      'allow',
      'clipboard-write; autoplay',
    );
    element.setAttribute('allowfullscreen', 'true');
    element.setAttribute('title', 'Rutube video');
    return {element};
  }

  static override importDOM(): DOMConversionMap | null {
    return {
      iframe: (domNode: HTMLElement) => {
        if (!domNode.hasAttribute('data-lexical-rutube')) {
          return null;
        }
        return {
          conversion: $convertRutubeElement,
          priority: 1,
        };
      },
    };
  }

  override updateDOM(): false {
    return false;
  }

  getId(): string {
    return this.__id;
  }

  override getTextContent(): string {
    return `https://rutube.ru/video/${this.__id}/`;
  }

  override decorate(_editor: LexicalEditor, config: EditorConfig): JSX.Element {
    const embedBlockTheme = config.theme.embedBlock || {};
    const className = {
      base: embedBlockTheme.base || '',
      focus: embedBlockTheme.focus || '',
    };
    return (
      <RutubePlayer
        className={className}
        format={this.__format}
        nodeKey={this.getKey()}
        videoID={this.__id}
      />
    );
  }
}

export function $createRutubeNode(videoID: string): RutubeNode {
  return new RutubeNode(videoID);
}

export function $isRutubeNode(
  node: RutubeNode | LexicalNode | null | undefined,
): node is RutubeNode {
  return node instanceof RutubeNode;
}
