import { useEffect, useState, useCallback } from 'react';
import { Alert, Box, Icon, Typography, Collapse } from '@mui/material';
import type { NotificationProps } from './Notification.types';
import { styles } from './Notification.styles';

export default function Notification({ title, subtitle, icon, time, onClose }: NotificationProps) {
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
          setOpen(false);
          return 0;
        }
        return prev - interval;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [time]);

  const progress = time && time > 0 ? (timeLeft / time) * 100 : 0;

  return (
    <Collapse in={open} onExited={handleExited} unmountOnExit>
      <Alert 
        severity="info" 
        variant="filled" 
        onClose={handleClose}
        icon={icon ? <Icon>{icon}</Icon> : undefined}
        sx={styles.alert}
      >
        <Typography variant="subtitle2" sx={styles.title}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={styles.subtitle}>
            {subtitle}
          </Typography>
        )}
        {time && time > 0 && (
          <Box sx={styles.progressBarContainer}>
            <Box sx={styles.progressBar(progress)} />
          </Box>
        )}
      </Alert>
    </Collapse>
  );
}