import { useEffect, useState, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { createApiClient } from '@/Endpoints/factory/factory';
import { READ_REQUEST_RETRY_COUNT } from '@/Endpoints/factory/factory.const';

export default function QuerySession({ children }: { children: ReactNode }) {
  const [client] = useState(() => createApiClient({ retryCount: READ_REQUEST_RETRY_COUNT, sessionScoped: false }));
  useEffect(() => () => { void client.cancelQueries(); }, [client]);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
