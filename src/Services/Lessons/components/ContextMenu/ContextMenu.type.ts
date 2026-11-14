

export interface ContextMenuProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onOpen: () => void;
  onRename: () => void;
  onMove?: () => void;
  onDelete: () => void;
}
