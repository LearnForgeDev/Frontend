import { Box, Typography, Fade } from '@mui/material';
import { CheckCircle, Warning, Error as ErrorIcon } from '@mui/icons-material';
import { useToastStore, ToastSeverity, type ToastMessage } from '@/Storage/useToastStore';

const getIcon = (severity: ToastSeverity) => {
  switch (severity) {
    case ToastSeverity.SUCCESS:
      return <CheckCircle sx={{ color: '#4caf50' }} />;
    case ToastSeverity.WARNING:
      return <Warning sx={{ color: '#ff9800' }} />;
    case ToastSeverity.ERROR:
      return <ErrorIcon sx={{ color: '#f44336' }} />;
    default:
      return null;
  }
};

const getBackgroundColor = (severity: ToastSeverity) => {
  switch (severity) {
    case ToastSeverity.SUCCESS:
      return '#edf7ed';
    case ToastSeverity.WARNING:
      return '#fff4e5';
    case ToastSeverity.ERROR:
      return '#fdeded';
    default:
      return '#ffffff';
  }
};

const getTextColor = (severity: ToastSeverity) => {
  switch (severity) {
    case ToastSeverity.SUCCESS:
      return '#1e4620';
    case ToastSeverity.WARNING:
      return '#663c00';
    case ToastSeverity.ERROR:
      return '#5f2120';
    default:
      return '#000000';
  }
};

const Toast = ({ toast }: { toast: ToastMessage }) => {
  return (
    <Fade in={toast.visible !== false} timeout={500}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          padding: '12px 20px',
          borderRadius: '8px',
          backgroundColor: getBackgroundColor(toast.severity),
          color: getTextColor(toast.severity),
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          minWidth: '250px',
          maxWidth: '400px',
        }}
      >
        {getIcon(toast.severity)}
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {toast.message}
        </Typography>
      </Box>
    </Fade>
  );
};

export default function GlobalToastContainer() {
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} />
      ))}
    </Box>
  );
}

// Mount the container automatically
if (typeof window !== 'undefined') {
  import('react-dom/client').then(({ createRoot }) => {
    let toastRoot = document.getElementById('global-toast-root');
    if (!toastRoot) {
      toastRoot = document.createElement('div');
      toastRoot.id = 'global-toast-root';
      document.body.appendChild(toastRoot);
    }
    const root = createRoot(toastRoot);
    root.render(<GlobalToastContainer />);
  });
}

