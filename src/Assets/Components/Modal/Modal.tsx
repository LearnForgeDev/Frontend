import { useCallback, useEffect, useState } from 'react';
import { Box, Dialog, DialogContent, IconButton, Fade, Typography, Icon } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import type { ModalProps } from './Modal.types';
import { styles } from './Modal.styles';

export function Modal({ title, subtitle, icon, time, className, onClose, children }: ModalProps) {
  const [open, setOpen] = useState(true);
  const [timeLeft, setTimeLeft] = useState(time ?? 0);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleExited = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!time || time <= 0) return;

    const interval = 100;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev - interval <= 0) {
          clearInterval(timer);
          handleClose();
          return 0;
        }
        return prev - interval;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [time, handleClose]);

  const progress = time && time > 0 ? (timeLeft / time) * 100 : 0;

  return (
    <Dialog
      open={open}
      className={className}
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
          sx: styles.dialogPaper,
        },
      }}
    >
      <IconButton
        aria-label="закрыть"
        onClick={handleClose}
        sx={styles.closeBtn}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={styles.dialogContent}>
        {title && (
          <Box sx={styles.header}>
            {icon && (
              <Icon sx={styles.icon}>{icon}</Icon>
            )}
            <Box>
              <Typography variant="h6" component="h2" sx={styles.title}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" sx={styles.subtitle}>
                  {subtitle}
                </Typography>
              )}
            </Box>
          </Box>
        )}

        {time && time > 0 && (
          <Box sx={styles.progressBarContainer}>
            <Box sx={styles.progressBar(progress)} />
          </Box>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
}