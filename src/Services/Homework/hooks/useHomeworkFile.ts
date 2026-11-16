import { useCallback, useEffect, useState } from 'react';
import { homeworkEndpoints } from '@/Endpoints/Homework/homework';
import type { HomeworkFileSource } from '../homework.type';

export function useHomeworkFile({ schoolPublicId, homeworkPublicId, attemptPublicId, questionId, filePublicId, isImage }: HomeworkFileSource) {
  const [content, setContent] = useState({ key: '', url: '', error: false });
  const [retry, setRetry] = useState(0);
  const key = `${schoolPublicId}:${homeworkPublicId}:${attemptPublicId}:${questionId}:${filePublicId}`;
  const read = useCallback((signal?: AbortSignal) => attemptPublicId
    ? homeworkEndpoints.answerFile(schoolPublicId, attemptPublicId, questionId, filePublicId, signal)
    : homeworkEndpoints.questionFile(schoolPublicId, homeworkPublicId, questionId, filePublicId, signal), [schoolPublicId, homeworkPublicId, attemptPublicId, questionId, filePublicId]);
  useEffect(() => {
    if (!isImage) {
      return;
    }
    const controller = new AbortController();
    let objectUrl = '';
    void read(controller.signal).then(blob => {
      if (!controller.signal.aborted) {
        objectUrl = URL.createObjectURL(blob);
        setContent({ key, url: objectUrl, error: false });
      }
    }).catch(() => {
      if (!controller.signal.aborted) {
        setContent({ key, url: '', error: true });
      }
    });
    return () => {
      controller.abort();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [read, isImage, retry, key]);
  const download = async (fileName: string) => {
    try {
      const blob = await read();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = fileName;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
    } catch {
      setContent(previous => ({ ...previous, key, error: true }));
    }
  };
  return { url: content.key === key ? content.url : '', error: content.key === key && content.error, retry: () => setRetry(value => value + 1), download };
}
