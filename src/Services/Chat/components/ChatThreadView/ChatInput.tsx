import { useState } from 'react';
import { Box, TextField, IconButton, Chip } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { widgetStyles } from '../ChatWidget/ChatWidget.styles';
import { MESSAGE_MAX_LENGTH, CSS } from '@/Services/Chat/Chat.const';
import FileSelectorModal from '../FileSelectorModal/FileSelectorModal';

interface ChatInputProps {
  onSendMessage: (text: string, filePublicIds?: string[]) => void;
  disabled?: boolean;
  schoolPublicId: string;
}

export default function ChatInput({ onSendMessage, disabled, schoolPublicId }: ChatInputProps) {
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
    <Box sx={{ display: 'flex', flexDirection: 'column' }} className={CSS.inputBar}>
      {/* Attached files preview */}
      {attachedFiles.length > 0 && (
        <Box sx={{ p: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5, borderTop: (theme) => `1px solid ${theme.palette.divider}`, bgcolor: 'background.default' }}>
          {attachedFiles.map((file) => (
            <Chip
              key={file.publicId}
              label={file.fileName}
              onDelete={() => setAttachedFiles(prev => prev.filter(f => f.publicId !== file.publicId))}
              size="small"
              sx={{ maxWidth: 150 }}
            />
          ))}
        </Box>
      )}

      <Box sx={widgetStyles.inputArea}>
        <Box sx={{ display: 'flex', gap: 1, width: '100%', alignItems: 'center' }}>
          <IconButton
            color="primary"
            onClick={() => setIsFileModalOpen(true)}
            disabled={disabled}
            aria-label="Прикрепить файл"
          >
            <AttachFileIcon sx={{ transform: 'rotate(45deg)' }} />
          </IconButton>
          <TextField
            fullWidth
            size="small"
            placeholder="Введите сообщение..."
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
            sx={{ alignSelf: 'flex-end' }}
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
