import { useToast } from '@/Storage/useToastStore';
import { getInviteUrl } from '../Components/InviteWidget.utils';

export function useCopyInvite() {
  const toast = useToast();
  return async (token: string) => {
    try { await navigator.clipboard.writeText(getInviteUrl(token)); toast.success('Ссылка скопирована'); }
    catch { toast.error('Не удалось скопировать ссылку'); }
  };
}
