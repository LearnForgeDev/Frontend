

export interface ModalConfig {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  time?: number;
}

export interface GlobalModalState {
  modals: ModalConfig[];
  pushModal: (modal: ModalConfig) => void;
  popModal: () => void;
  clearModals: () => void;
}
