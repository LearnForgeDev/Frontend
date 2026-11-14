import type { NodeKey, SerializedLexicalNode, Spread } from 'lexical';

export interface FilePayload {
  fileName: string;
  url: string;
  sizeBytes?: number;
  key?: NodeKey;
}

export type SerializedFileNode = Spread<
  {
    fileName: string;
    url: string;
    sizeBytes?: number;
  },
  SerializedLexicalNode
>;
