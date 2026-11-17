import { useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import type { CourseTimeOptions } from './useCourseTime.type';

export function useCourseTime({ coursePublicId, itemPublicId, enabled, activity }: CourseTimeOptions) {
  const [errorItem, setErrorItem] = useState<string | null>(null);
  useEffect(() => {
    if (!enabled || !itemPublicId) {
      return;
    }
    const sessionId = crypto.randomUUID();
    let startedAt: number | null = null;
    let pending = false;
    let active = true;
    const send = async () => {
      if (pending) {
        return;
      }
      pending = true;
      try {
        const now = Date.now();
        await activity(coursePublicId, itemPublicId, {
          kind: startedAt === null ? 0 : 1,
          sessionId,
          elapsedSeconds: startedAt === null ? 0 : Math.floor((now - startedAt) / 1000),
        });
        startedAt ??= now;
        if (active) {
          setErrorItem(null);
        }
      } catch (error) {
        if (isAxiosError(error) && error.response?.status === 409) {
          startedAt = null;
        }
        if (active) {
          setErrorItem(itemPublicId);
        }
      } finally {
        pending = false;
      }
    };
    void send();
    const interval = window.setInterval(() => void send(), 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
      if (startedAt !== null) {
        void send();
      }
    };
  }, [activity, coursePublicId, itemPublicId, enabled]);
  return enabled && errorItem === itemPublicId;
}
