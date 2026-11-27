export type { ChatsWorkspaceState } from './useChatsWorkspace.type';
import { useCallback, useState } from 'react';
import { useToast } from '@/Storage/useToastStore';
import { getIsMobileDevice } from '@/Assets/device.utils';
import type { ChatThread, ChatType } from '@/Services/Chat/Chat.type';
import type { MemberDto } from '@/Endpoints/schools/schools.contract.type';
import { useChats } from './useChats';
import { useRequestedDirectChat } from './useRequestedDirectChat';
import { isChatGroupNameValid } from '../validation/chatGroup';

export function useChatsWorkspace(schoolPublicId: string) {
  const chats = useChats(schoolPublicId);
  const toast = useToast();
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
  const directThreads = chats.direct.threads;
  useRequestedDirectChat({ directThreads, onOpenThread: openRequestedThread });
  const activeThreads = activeReference?.type === 'direct' ? directThreads : chats.branchThreads;
  const activeThread = activeThreads.find(thread => thread.id === activeReference?.id) ?? null;
  const currentThreads = activeTab === 'branch' ? chats.branchThreads : directThreads;
  const currentList = activeTab === 'branch' ? chats : chats.direct;

  const createGroup = async () => {
    if (!isChatGroupNameValid(groupName) || chats.isCreatingBranch) {
      return;
    }
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
    const thread = directThreads.find(item => item.id === selectedMember?.userPublicId);
    if (!thread) {
      return;
    }
    openThread(thread);
    setSelectedMember(null);
    setDialog(null);
  };

  return {
    activeTab, setActiveTab, activeThread, currentThreads, openThread,
    isMobile: Boolean(getIsMobileDevice()),
    isLoading: currentList.isLoading, isError: currentList.isError, refetch: currentList.refetch,
    members: chats.direct.members, isMembersLoading: chats.direct.isLoading,
    isCreatingBranch: chats.isCreatingBranch,
    dialog, openDialog: () => setDialog(activeTab), closeDialog: () => setDialog(null),
    groupName, setGroupName, groupDesc, setGroupDesc, selectedMember, setSelectedMember,
    canCreateGroup: isChatGroupNameValid(groupName) && !chats.isCreatingBranch,
    createGroup, createDirect, closeThread: () => setActiveReference(null),
  };
}
