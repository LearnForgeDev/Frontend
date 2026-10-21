import { styles as pageStyles } from '../../ChatsPage.styles';

export const styles = {
  sidebar: (isMobile: boolean, hasThread: boolean) => ({ ...pageStyles.sidebar, width: isMobile ? '100%' : '320px', display: isMobile && hasThread ? 'none' : 'flex' }),
  area: (isMobile: boolean, hasThread: boolean) => ({ ...pageStyles.chatArea, flex: 1, display: isMobile && !hasThread ? 'none' : 'flex' }),
  placeholderIcon: { fontSize: '5rem', color: 'text.secondary' },
} as const;
