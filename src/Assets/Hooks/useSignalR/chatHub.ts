import { useEffect, useState } from 'react';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import type { ChatType } from '@/Services/Chat/Chat.types';
import { RECONNECT_DELAYS_MS } from '@/Services/Chat/Chat.const';
import config from '../../../config';
import { createDebugger, DebugSeverity } from '@/Assets/debugUtils';
const logger = createDebugger('chatHub');


export interface ChatHubParams {
  type: ChatType;
  schoolPublicId: string;
  threadId: string; // branchId or otherUserId
}

export function useChatHubConnection(params: ChatHubParams) {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'reconnecting' | 'disconnected'>('disconnected');

  const { type, schoolPublicId, threadId } = params;

  useEffect(() => {
    if (!schoolPublicId || !threadId) return;

    const baseUrl = config.endpointUrl || '';

    // Note: Typo in 'breanchId' is intentional to match API documentation.
    const url = type === 'branch'
      ? `${baseUrl}/chatHub?schoolPublicId=${schoolPublicId}&breanchId=${threadId}`
      : `${baseUrl}/directChatHub?schoolPublicId=${schoolPublicId}&otherUserId=${threadId}`;

    const newConnection = new HubConnectionBuilder()
      .withUrl(url)
      .withAutomaticReconnect(RECONNECT_DELAYS_MS)
      .build();

    const startConnection = async () => {
      try {
        setConnection(newConnection);
        setStatus('connecting');
        await newConnection.start();
        setStatus('connected');
      } catch (err) {
        logger.logEventForDebug(DebugSeverity.DANGER, 'SignalR Connection Error: ', err);
        setStatus('disconnected');
      }
    };

    newConnection.onreconnecting(() => setStatus('reconnecting'));
    newConnection.onreconnected(() => setStatus('connected'));
    newConnection.onclose(() => setStatus('disconnected'));

    startConnection();

    return () => {
      newConnection.stop().then(() => {
        setStatus('disconnected');
      });
    };
  }, [type, schoolPublicId, threadId]);

  return { connection, status };
}
