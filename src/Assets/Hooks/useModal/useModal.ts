import { useCallback } from 'react';
import { useGlobalModalStore } from '../../../Storage/globalModalStore';
import type { ModalConfig } from '../../../Storage/globalModalStore';

function generateId() {
  return Math.random().toString(36).slice(2, 9);
}

export function useModal() {
  const pushModal = useGlobalModalStore((state) => state.pushModal);
  const clearModals = useGlobalModalStore((state) => state.clearModals);

  const createModal = useCallback((title: string, subtitle?: string, icon?: string, time: number = 3000) => {
    const newModal: ModalConfig = {
      id: generateId(),
      title,
      subtitle,
      icon,
      time,
    };
    pushModal(newModal);
  }, [pushModal]);

  const clearAllModal = useCallback(() => {
    clearModals();
  }, [clearModals]);

  return { createModal, clearAllModal };
}
