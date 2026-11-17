import { useEffect } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';
import config from '@/config';
import { useUser } from '@/Services/Auth/hooks/useUser';
import { HOMEWORK_POLL_MS } from '../homework.const';

export function useHomeworkRealtime(schoolPublicId: string, homeworkPublicId: string, refresh: () => Promise<unknown>) {
  const { user } = useUser();
  const token = user?.jwtToken ?? '';
  useEffect(() => {
    if (!schoolPublicId || !homeworkPublicId) {
      return;
    }
    const params = new URLSearchParams({ schoolPublicId, homeworkPublicId });
    const connection = new HubConnectionBuilder()
      .withUrl(`${config.endpointUrl}/homeworkHub?${params.toString()}`, { accessTokenFactory: () => token })
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .build();
    let active = true;
    const update = () => {
      if (active) {
        void refresh();
      }
    };
    connection.on('HomeworkChanged', update);
    connection.onreconnected(update);
    void connection.start().catch(() => undefined);
    const timer = window.setInterval(update, HOMEWORK_POLL_MS);
    window.addEventListener('online', update);
    window.addEventListener('focus', update);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener('online', update);
      window.removeEventListener('focus', update);
      void connection.stop().catch(() => undefined);
    };
  }, [schoolPublicId, homeworkPublicId, refresh, token]);
}
