import type { SerializedLexicalNode, Spread } from 'lexical';

export type SerializedEquationNode = Spread<
  {
    equation: string;
    inline: boolean;
  },
  SerializedLexicalNode
>;
