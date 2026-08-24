import { IconButton, Tooltip } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import { ClipLoader } from 'react-spinners';
import { CREATE_CALL_INVITE_LABEL } from './ChatCallInviteButton.const';
import { styles } from './ChatCallInviteButton.styles';

interface ChatCallInviteButtonProps {
  disabled?: boolean;
  isPending?: boolean;
  onClick: () => void;
}

export default function ChatCallInviteButton({
  disabled,
  isPending,
  onClick,
}: ChatCallInviteButtonProps) {
  return (
    <Tooltip title={CREATE_CALL_INVITE_LABEL}>
      <span>
        <IconButton
          color="inherit"
          onClick={onClick}
          disabled={disabled || isPending}
          aria-label={CREATE_CALL_INVITE_LABEL}
          sx={styles.button}
        >
          {isPending ? <ClipLoader size={18} color="currentColor" /> : <VideocamIcon />}
        </IconButton>
      </span>
    </Tooltip>
  );
}
