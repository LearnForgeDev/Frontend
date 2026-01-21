import {type ReactNode, useCallback} from "react";
import { useState, useEffect } from "react";
import '../../styles/common/Modal.css'

/**
 * Modal component - renders an accessible modal dialog.
 *
 * Props:
 * @param children - Content displayed inside the modal.
 * @param className - Optional additional class name for the modal overlay.
 * @param onClose - Callback invoked when the modal should close
 *   (overlay clicks or close button). The parent should unmount the modal.
 *   */
export function Modal({ children, onClose, className }: { children: ReactNode; className?: string; onClose: () => void }) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    const ANIMATION_DURATION = 200;

    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, ANIMATION_DURATION);
  }, [onClose]);


  useEffect(() => {

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') handleClose();
  }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [handleClose]);

  return (
    <div
      className={`modalOverlay ${isClosing ? 'closing' : ''}`}
      role="dialog"
      aria-modal="true"
      onClick={handleClose}
    >
      <div
        className={`modal ${className ?? ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="closeBtn"
          onClick={handleClose}
          aria-label="закрыть"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}