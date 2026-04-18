import { type ReactNode, useCallback, useState } from 'react';
import { Box, Dialog, DialogContent, IconButton, Fade } from '@mui/material';

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
  const [open, setOpen] = useState(true);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleExited = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-modal="true"
      slots={{ transition: Fade }}
      slotProps={{
        transition: { onExited: handleExited },
        backdrop: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(2px)',
          },
        },
        paper: {
          className,
          sx: {
            background: 'var(--bg)',
            color: 'var(--text)',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
            overflow: 'hidden',
            position: 'relative',
            padding: 0,
            maxHeight: 'calc(100vh - 2rem)',
          },
        },
      }}
    >
      <DialogContent
        sx={{
          padding: '1.25rem',
          paddingRight: '3rem',
          overflowY: 'auto',
        }}
      >
        <IconButton
          aria-label="закрыть"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: '0.5rem',
            right: '0.5rem',
            color: 'var(--muted-text)',
            borderRadius: '4px',
            '&:hover': {
              background: 'rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          <Box component="span" sx={{ fontSize: '2rem', lineHeight: 1 }}>
            ×
          </Box>
        </IconButton>
        {children}
      </DialogContent>
    </Dialog>
  );
}