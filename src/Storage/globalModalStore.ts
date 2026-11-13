import type { GlobalModalState } from './globalModalStore.type';
export type { ModalConfig } from './globalModalStore.type';
import { create } from 'zustand';

export const useGlobalModalStore = create<GlobalModalState>((set) => ({
  modals: [],
  pushModal: (modal) => set((state) => ({ modals: [...state.modals, modal] })),
  popModal: () => set((state) => ({ modals: state.modals.slice(1) })), // Queue system
  clearModals: () => set({ modals: [] }),
}));
