import { createPortal } from 'react-dom';
import { Box } from '@mui/material';
import { useGlobalNotificationStore } from '../../../Storage/globalNotificationStore';
import Notification from '../Notification/Notification';

export function NotificationRoot() {
  const notifications = useGlobalNotificationStore((state) => state.notifications);
  const removeNotification = useGlobalNotificationStore((state) => state.removeNotification);

  if (notifications.length === 0) return null;

  return createPortal(
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 2000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: 'none',
        '& > *': {
          pointerEvents: 'auto',
        }
      }}
    >
      {notifications.map((notif) => (
        <Notification
          key={notif.id}
          title={notif.title}
          subtitle={notif.subtitle}
          icon={notif.icon}
          time={notif.time}
          onClose={() => removeNotification(notif.id)}
        />
      ))}
    </Box>,
    document.body
  );
}
