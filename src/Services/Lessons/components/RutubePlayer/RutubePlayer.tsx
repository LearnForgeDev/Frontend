import type { RutubeComponentProps } from "@/Services/Lessons/components/TextEditorComponents/nodes/RutubeNode.type";

import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents';

export default function RutubePlayer({
  className,
  format,
  nodeKey,
  videoID,
}: RutubeComponentProps) {
  return (
    <BlockWithAlignableContents
      className={className}
      format={format}
      nodeKey={nodeKey}>
      <iframe
        width="560"
        height="315"
        src={`https://rutube.ru/play/embed/${videoID}/`}
        style={{border: 'none'}}
        allowFullScreen={true}
        title="Rutube video"
      />
    </BlockWithAlignableContents>
  );
}
