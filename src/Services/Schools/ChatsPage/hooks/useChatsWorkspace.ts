import { useCallback, useState } from 'react';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import { useToast } from '@/Storage/useToastStore';
import { getIsMobileDevice } from '@/Assets/device.utils';
import type { ChatThread, ChatType } from '@/Services/Chat/Chat.types';
import type { MemberDto } from '@/Endpoints/schools/types';
import { useChats } from './useChats';
import { useRequestedDirectChat } from './useRequestedDirectChat';
import { isChatGroupNameValid } from '../validation/chatGroup';

export function useChatsWorkspace(schoolPublicId: string) {
  const chats = useChats(schoolPublicId);
  const toast = useToast();
  const userPublicId = useGlobalContext(state => state.auth.user?.userPublicId);
  const [activeTab, setActiveTab] = useState<ChatType>('branch');
  const [activeReference, setActiveReference] = useState<{ id: string; type: ChatType } | null>(null);
  const [dialog, setDialog] = useState<ChatType | null>(null);
  const [groupName, setGroupName] = useState('');
  const [groupDesc, setGroupDesc] = useState('');
  const [selectedMember, setSelectedMember] = useState<MemberDto | null>(null);
  const openThread = (thread: ChatThread) => setActiveReference({ id: thread.id, type: thread.type });
  const openRequestedThread = useCallback((thread: ChatThread) => {
    setActiveTab('direct');
    setActiveReference({ id: thread.id, type: thread.type });
  }, []);
  useRequestedDirectChat({ members: chats.members, directThreads: chats.directThreads, addDirectChat: chats.addDirectChat, onOpenThread: openRequestedThread });
  const activeThread = [...chats.branchThreads, ...chats.directThreads].find(thread => thread.id === activeReference?.id && thread.type === activeReference?.type) ?? null;
  const currentThreads = activeTab === 'branch' ? chats.branchThreads : chats.directThreads;

  const createGroup = async () => {
    if (!isChatGroupNameValid(groupName) || chats.isCreatingBranch) return;
    try {
      const branch = await chats.createBranch({ name: groupName.trim(), description: groupDesc.trim() });
      setActiveReference({ id: branch.publicId, type: 'branch' });
      setGroupName('');
      setGroupDesc('');
      setDialog(null);
      toast.success('Групповой чат создан');
    } catch {
      toast.error('Не удалось создать групповой чат. Попробуйте ещё раз.');
    }
  };
  const createDirect = () => {
    if (!selectedMember) return;
    openThread(chats.addDirectChat(selectedMember.displayName, selectedMember.userPublicId));
    setSelectedMember(null);
    setDialog(null);
  };

  return {
    ...chats, activeTab, setActiveTab, activeThread, currentThreads, openThread,
    isMobile: Boolean(getIsMobileDevice()),
    members: chats.members.filter(member => member.userPublicId !== userPublicId),
    dialog, openDialog: () => setDialog(activeTab), closeDialog: () => setDialog(null),
    groupName, setGroupName, groupDesc, setGroupDesc, selectedMember, setSelectedMember,
    canCreateGroup: isChatGroupNameValid(groupName) && !chats.isCreatingBranch,
    createGroup, createDirect, closeThread: () => setActiveReference(null),
  };
}

export type ChatsWorkspaceState = ReturnType<typeof useChatsWorkspace>;
