import { useReducer, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/Storage/useToastStore';
import { CHAT_SEND_ERROR } from './useChatDraft.const';
import { canSendChatDraft, chatDraftReducer, createChatDraft } from './useChatDraft.utils';
import type { ChatDraftFile, ChatDraftSnapshot } from './useChatDraft.types';

interface UseChatDraftOptions {
  draftKey: string;
  disabled?: boolean;
  onSendMessage: (text: string, filePublicIds?: string[]) => Promise<void>;
}

export function useChatDraft({ draftKey, disabled, onSendMessage }: UseChatDraftOptions) {
  const [drafts, dispatch] = useReducer(chatDraftReducer, {});
  const [isFileModalOpen, setFileModalOpen] = useState(false);
  const sendingRef = useRef(false);
  const toast = useToast();
  const draft = drafts[draftKey] ?? createChatDraft();
  const send = useMutation({
    networkMode: 'always',
    mutationFn: (snapshot: ChatDraftSnapshot) => onSendMessage(snapshot.text.trim(), snapshot.files.map(file => file.publicId)),
    onSuccess: (_, snapshot) => dispatch({ type: 'sent', snapshot }),
    onError: (_, snapshot) => {
      dispatch({ type: 'error', key: snapshot.key, error: CHAT_SEND_ERROR });
      toast.error(CHAT_SEND_ERROR);
    },
  });
  const submit = () => {
    if (sendingRef.current || disabled || !canSendChatDraft(draft)) return;
    sendingRef.current = true;
    dispatch({ type: 'error', key: draftKey, error: null });
    send.mutate({ ...draft, key: draftKey }, { onSettled: () => { sendingRef.current = false; } });
  };
  return {
    ...draft, submit, isSending: send.isPending, canSend: !disabled && !send.isPending && canSendChatDraft(draft),
    isFileModalOpen, openFileModal: () => setFileModalOpen(true), closeFileModal: () => setFileModalOpen(false),
    setText: (text: string) => dispatch({ type: 'text', key: draftKey, text }),
    selectFiles: (files: ChatDraftFile[]) => dispatch({ type: 'files', key: draftKey, files: files.map(file => ({ ...file, selectionId: crypto.randomUUID() })) }),
    removeFile: (selectionId: string) => dispatch({ type: 'removeFile', key: draftKey, selectionId }),
  };
}
