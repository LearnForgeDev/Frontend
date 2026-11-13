

export interface ChatInputProps {
  onSendMessage: (text: string, filePublicIds?: string[]) => Promise<void>;
  disabled?: boolean;
  schoolPublicId: string;
  draftKey: string;
}
