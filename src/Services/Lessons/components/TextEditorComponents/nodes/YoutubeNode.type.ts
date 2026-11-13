import type { NodeKey, Spread, SerializedLexicalNode } from 'lexical';

export type YouTubeComponentProps = Readonly<{
  className: string;
  nodeKey: NodeKey;
  videoID: string;
}>;

export type SerializedYouTubeNode = Spread<
  {
    videoID: string;
  },
  SerializedLexicalNode
>;
