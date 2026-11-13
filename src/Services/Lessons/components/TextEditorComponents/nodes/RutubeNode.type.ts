import type { ElementFormatType, NodeKey, Spread } from 'lexical';
import type { SerializedDecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode';

export type RutubeComponentProps = Readonly<{
  className: Readonly<{
    base: string;
    focus: string;
  }>;
  format: ElementFormatType | null;
  nodeKey: NodeKey;
  videoID: string;
}>;

export type SerializedRutubeNode = Spread<
  {
    videoID: string;
  },
  SerializedDecoratorBlockNode
>;
