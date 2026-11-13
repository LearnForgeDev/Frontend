import type { NodeKey, SerializedLexicalNode, Spread } from 'lexical';

export interface GraphPayload {
  key?: NodeKey;
}

export type SerializedGraphNode = Spread<
  object,
  SerializedLexicalNode
>;
