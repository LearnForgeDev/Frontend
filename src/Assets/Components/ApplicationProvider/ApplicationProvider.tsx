import { useState } from 'react';
import { Provider } from 'react-redux';
import { createApplicationStore } from '@/Storage/Application/application.store';
import type { ApplicationProviderProps } from './ApplicationProvider.type';

export default function ApplicationProvider({ children }: ApplicationProviderProps) {
  const [store] = useState(createApplicationStore);
  return <Provider store={store}>{children}</Provider>;
}
