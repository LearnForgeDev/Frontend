import type { NodeKey, SerializedLexicalNode, Spread } from 'lexical';

export interface ImagePayload {
  altText: string;
  src: string;
  width?: number;
  height?: number;
  float?: 'left' | 'right' | 'center';
  key?: NodeKey;
}

export type SerializedImageNode = Spread<
  {
    altText: string;
    src: string;
    width?: number;
    height?: number;
  },
  SerializedLexicalNode
>;

export interface ResizeImagePayload {
  nodeKey: NodeKey;
  width: number | undefined;
  height: number | undefined;
}
