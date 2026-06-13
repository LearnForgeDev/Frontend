import { createPortal } from 'react-dom';
import { useGlobalModalStore } from '../../../Storage/globalModalStore';
import { Modal } from '../Modal/Modal';

export function ModalRoot() {
  const modals = useGlobalModalStore((state) => state.modals);
  const popModal = useGlobalModalStore((state) => state.popModal);

  // Queue system: only display the first modal
  const currentModal = modals.length > 0 ? modals[0] : null;

  if (!currentModal) return null;

  return createPortal(
    <Modal
      key={currentModal.id}
      title={currentModal.title}
      subtitle={currentModal.subtitle}
      icon={currentModal.icon}
      time={currentModal.time}
      onClose={popModal}
    />,
    document.body
  );
}
