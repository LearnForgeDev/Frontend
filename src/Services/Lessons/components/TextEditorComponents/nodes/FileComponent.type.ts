import type { NodeKey } from 'lexical';

export interface FileComponentProps {
  fileName: string;
  url: string;
  sizeBytes?: number;
  nodeKey: NodeKey;
}
