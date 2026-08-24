import { useState } from 'react';
import { Box, TextField, IconButton, Chip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { widgetStyles } from '../ChatWidget/ChatWidget.styles';
import { MESSAGE_MAX_LENGTH, CSS } from '@/Services/Chat/Chat.const';
import FileSelectorModal from '../FileSelectorModal/FileSelectorModal';
import {
  ATTACH_FILE_LABEL,
  CHAT_INPUT_PLACEHOLDER,
  SEND_MESSAGE_LABEL,
} from './ChatInput.const';
import { styles } from './ChatInput.styles';

interface ChatInputProps {
  onSendMessage: (text: string, filePublicIds?: string[]) => void;
  disabled?: boolean;
  schoolPublicId: string;
}

export default function ChatInput({
  onSendMessage,
  disabled,
  schoolPublicId,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<Array<{ publicId: string; fileName: string }>>([]);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);

  const handleSelectFiles = (selected: Array<{ publicId: string; fileName: string }>) => {
    setAttachedFiles(prev => {
      const prevIds = prev.map(f => f.publicId);
      const filtered = selected.filter(f => !prevIds.includes(f.publicId));
      return [...prev, ...filtered];
    });
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if ((trimmed || attachedFiles.length > 0) && trimmed.length <= MESSAGE_MAX_LENGTH && !disabled) {
      onSendMessage(trimmed, attachedFiles.map(f => f.publicId));
      setText('');
      setAttachedFiles([]);
    }
  };

  return (
    <Box sx={styles.root} className={CSS.inputBar}>
      {attachedFiles.length > 0 && (
        <Box sx={styles.attachedFiles}>
          {attachedFiles.map((file) => (
            <Chip
              key={file.publicId}
              label={file.fileName}
              onDelete={() => setAttachedFiles(prev => prev.filter(f => f.publicId !== file.publicId))}
              size="small"
              sx={styles.attachedFileChip}
            />
          ))}
        </Box>
      )}

      <Box sx={widgetStyles.inputArea}>
        <Box sx={styles.controls}>
          <IconButton
            color="primary"
            onClick={() => setIsFileModalOpen(true)}
            disabled={disabled}
            aria-label={ATTACH_FILE_LABEL}
          >
            <AttachFileIcon sx={styles.attachIcon} />
          </IconButton>
          <TextField
            fullWidth
            size="small"
            placeholder={CHAT_INPUT_PLACEHOLDER}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={disabled}
            multiline
            maxRows={3}
            slotProps={{ htmlInput: { maxLength: MESSAGE_MAX_LENGTH } }}
          />
          <IconButton 
            color="primary" 
            onClick={handleSend} 
            disabled={disabled || (!text.trim() && attachedFiles.length === 0)}
            sx={styles.sendButton}
            aria-label={SEND_MESSAGE_LABEL}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>

      <FileSelectorModal
        open={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        schoolPublicId={schoolPublicId}
        onSelectFiles={handleSelectFiles}
      />
    </Box>
  );
}
