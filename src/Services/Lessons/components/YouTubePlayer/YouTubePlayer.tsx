import type { YouTubeComponentProps } from "@/Services/Lessons/components/TextEditorComponents/nodes/YoutubeNode.type";

export default function YouTubePlayer({
  className,
  videoID,
}: YouTubeComponentProps) {
  return (
    <span className={className}>
      <iframe
        width="560"
        height="315"
        src={`https://www.youtube-nocookie.com/embed/${videoID}`}
        style={{border: 'none'}}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen={true}
        title="YouTube video"
      />
    </span>
  );
}
