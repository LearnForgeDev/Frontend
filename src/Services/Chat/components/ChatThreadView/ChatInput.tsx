import { Alert, Box, Button, Chip, IconButton, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { ClipLoader } from 'react-spinners';
import { MESSAGE_MAX_LENGTH, CSS } from '../../Chat.const';
import { useChatDraft } from '../../hooks/useChatDraft/useChatDraft';
import FileSelectorModal from '../FileSelectorModal/FileSelectorModal';
import { ATTACH_FILE_LABEL, CHAT_INPUT_PLACEHOLDER, SEND_MESSAGE_LABEL, RETRY_MESSAGE_LABEL, CHAT_INPUT_MAX_ROWS, SEND_LOADER_SIZE } from './ChatInput.const';
import { styles } from './ChatInput.styles';

interface ChatInputProps {
  onSendMessage: (text: string, filePublicIds?: string[]) => Promise<void>;
  disabled?: boolean;
  schoolPublicId: string;
  draftKey: string;
}

export default function ChatInput({ onSendMessage, disabled, schoolPublicId, draftKey }: ChatInputProps) {
  const draft = useChatDraft({ onSendMessage, disabled, draftKey });
  return (
    <Box sx={styles.root} className={CSS.inputBar}>
      {draft.error && <Alert severity="error" action={<Button data-testid="chat-send-retry" disabled={!draft.canSend} onClick={draft.submit}>{RETRY_MESSAGE_LABEL}</Button>}>{draft.error}</Alert>}
      {draft.files.length > 0 && <Box sx={styles.attachedFiles}>
        {draft.files.map(file => <Chip key={file.selectionId} label={file.fileName} onDelete={() => draft.removeFile(file.selectionId)} size="small" sx={styles.attachedFileChip} />)}
      </Box>}
      <Box sx={styles.inputArea}>
        <IconButton color="primary" onClick={draft.openFileModal} data-testid="chat-attach" aria-label={ATTACH_FILE_LABEL}><AttachFileIcon sx={styles.attachIcon} /></IconButton>
        <TextField fullWidth size="small" placeholder={CHAT_INPUT_PLACEHOLDER} value={draft.text} onChange={event => draft.setText(event.target.value)}
          onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); draft.submit(); } }}
          multiline maxRows={CHAT_INPUT_MAX_ROWS} slotProps={{ htmlInput: { maxLength: MESSAGE_MAX_LENGTH, 'data-testid': 'chat-message-input' } }} />
        <IconButton color="primary" onClick={draft.submit} disabled={!draft.canSend} sx={styles.sendButton} data-testid="chat-send" aria-label={SEND_MESSAGE_LABEL}>
          {draft.isSending ? <ClipLoader size={SEND_LOADER_SIZE} color="currentColor" /> : <SendIcon />}
        </IconButton>
      </Box>
      <FileSelectorModal open={draft.isFileModalOpen} onClose={draft.closeFileModal} schoolPublicId={schoolPublicId} onSelectFiles={draft.selectFiles} />
    </Box>
  );
}
