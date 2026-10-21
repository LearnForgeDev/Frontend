import { useEffect, useRef, useState } from 'react';

export function usePreviewMedia<T extends HTMLImageElement | HTMLIFrameElement>(blob: Blob) {
  const mediaRef = useRef<T>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;
    const url = URL.createObjectURL(blob);
    media.src = url;
    return () => {
      media.removeAttribute('src');
      URL.revokeObjectURL(url);
    };
  }, [blob]);

  return { mediaRef, isLoading, onLoad: () => setIsLoading(false) };
}
