import { useContext } from 'react';
import { AuthFlowContext } from '../contexts/AuthFlow.context';

export function useAuthFlow() {
  const form = useContext(AuthFlowContext);
  if (!form) throw new Error('Форма авторизации недоступна');
  return form;
}
