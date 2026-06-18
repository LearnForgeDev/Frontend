import { useState } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { widgetStyles } from '../ChatWidget/ChatWidget.styles';
import { MESSAGE_MAX_LENGTH, CSS } from '@/Services/Chat/Chat.const';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSendMessage, disabled }: ChatInputProps) {
  const [text, setText] = useState('');

  const handleSend = () => {
    const trimmed = text.trim();
    if (trimmed && trimmed.length <= MESSAGE_MAX_LENGTH && !disabled) {
      onSendMessage(trimmed);
      setText('');
    }
  };

  return (
    <Box sx={widgetStyles.inputArea} className={CSS.inputBar}>
      <Box sx={{ display: 'flex', gap: 1 }}>
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
          disabled={disabled || !text.trim()}
          sx={{ alignSelf: 'flex-end' }}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Box>
  );
}
