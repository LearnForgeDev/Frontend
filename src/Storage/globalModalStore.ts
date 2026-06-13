import { create } from 'zustand';

export interface ModalConfig {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  time?: number;
}

interface GlobalModalState {
  modals: ModalConfig[];
  pushModal: (modal: ModalConfig) => void;
  popModal: () => void;
  clearModals: () => void;
}

export const useGlobalModalStore = create<GlobalModalState>((set) => ({
  modals: [],
  pushModal: (modal) => set((state) => ({ modals: [...state.modals, modal] })),
  popModal: () => set((state) => ({ modals: state.modals.slice(1) })), // Queue system
  clearModals: () => set({ modals: [] }),
}));
