import { Popover, Box, Typography, Button, Divider } from '@mui/material';
import { useGlobalNotificationStore } from '@/Storage/globalNotificationStore';
import PendingSchoolRequestWidget from '../DashboardHome/Components/PendingSchoolRequestWidget';
import Notification from '@/Assets/Components/Notification/Notification';

interface NotificationsPopoverProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export default function NotificationsPopover({ anchorEl, onClose }: NotificationsPopoverProps) {
  const open = Boolean(anchorEl);
  const id = open ? 'notifications-popover' : undefined;

  const notifications = useGlobalNotificationStore((state) => state.notifications);
  const clearNotifications = useGlobalNotificationStore((state) => state.clearNotifications);
  const removeNotification = useGlobalNotificationStore((state) => state.removeNotification);
  const isNotificationsEmpty = useGlobalNotificationStore((state) => state.isNotificationsEmpty);

  return (
    <Popover
      id={id}
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      slotProps={{
        paper: {
          sx: {
            mt: 1.5,
            width: 380,
            maxHeight: 500,
            borderRadius: '1rem',
            boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
            display: 'flex',
            flexDirection: 'column',
          }
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
          Уведомления
        </Typography>
        {!isNotificationsEmpty() && (
          <Button size="small" onClick={clearNotifications} sx={{ textTransform: 'none' }}>
            Очистить все
          </Button>
        )}
      </Box>
      <Divider />
      <Box sx={{ overflowY: 'auto', p: 2, flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
        
        {/* Render standard notifications */}
        {notifications.length > 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {notifications.map((n) => (
              <Notification
                key={n.id}
                title={n.title}
                subtitle={n.subtitle}
                icon={n.icon}
                time={n.time} // If undefined, it might not auto-close depending on Notification implementation
                onClose={() => removeNotification(n.id)}
              />
            ))}
          </Box>
        ) : null}

        {/* The widget moved from Dashboard */}
        <Box sx={{ mt: notifications.length > 0 ? 1 : 0 }}>
          <PendingSchoolRequestWidget />
        </Box>

        {isNotificationsEmpty() && (
          <Typography sx={{ textAlign: 'center', color: 'text.secondary', mt: 2, mb: 2 }}>
            Нет новых уведомлений
          </Typography>
        )}
      </Box>
    </Popover>
  );
}
