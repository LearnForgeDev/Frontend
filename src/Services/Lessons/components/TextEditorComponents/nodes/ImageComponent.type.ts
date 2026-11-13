import type { NodeKey } from 'lexical';

export interface ImageComponentProps {
  src: string;
  altText: string;
  width?: number;
  height?: number;
  float?: 'left' | 'right' | 'center';
  nodeKey: NodeKey;
}
