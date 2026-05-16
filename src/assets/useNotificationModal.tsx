import { useCallback, useEffect, useRef, type ReactElement } from 'react';
import { createRoot } from 'react-dom/client';

import { Modal } from './CommonComponents/Modal';
import Notification from './CommonComponents/Notification';
import type { ModalTriggerProps, NotificationProps } from '../types/commonTypes';

type CleanupFn = () => void;

type RenderWithClose = (onClose: () => void) => ReactElement;

export default function useNotificationModal() {
  const activeCleanupsRef = useRef<Set<CleanupFn>>(new Set());

  const closeAll = useCallback(() => {
    const cleanups = Array.from(activeCleanupsRef.current);
    cleanups.forEach((cleanup) => {
      cleanup();
    });
  }, []);

  useEffect(() => {
    return () => {
      closeAll();
    };
  }, [closeAll]);

  const mountComponent = useCallback((renderWithClose: RenderWithClose) => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const root = createRoot(container);

    let hasCleaned = false;

    const cleanup: CleanupFn = () => {
      if (hasCleaned) {
        return;
      }

      hasCleaned = true;
      activeCleanupsRef.current.delete(cleanup);
      root.unmount();

      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };

    activeCleanupsRef.current.add(cleanup);
    root.render(renderWithClose(cleanup));

    return cleanup;
  }, []);

  const showNotification = useCallback(
    ({ success, title = '', message, durationMS }: NotificationProps) => {
      return mountComponent((onClose) => (
        <Notification
          success={success}
          title={title}
          message={message}
          durationMS={durationMS}
          onClose={onClose}
        />
      ));
    },
    [mountComponent],
  );

  const showModal = useCallback(
    ({ children, className, onClose }: ModalTriggerProps) => {
      return mountComponent((cleanup) => (
        <Modal
          className={className}
          onClose={() => {
            cleanup();
            onClose?.();
          }}
        >
          {children}
        </Modal>
      ));
    },
    [mountComponent],
  );

  return {
    showNotification,
    showModal,
    closeAll,
  };
}

