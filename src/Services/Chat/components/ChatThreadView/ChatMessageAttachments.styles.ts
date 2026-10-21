import { COMPACT_IMAGE_HEIGHT, COMPACT_IMAGE_WIDTH, MESSAGE_IMAGE_HEIGHT, MESSAGE_IMAGE_WIDTH } from './ChatMessageAttachments.const';

export const styles = {
  root: { mt: 1, display: 'flex', flexDirection: 'column', gap: 0.5, opacity: 0.9 },
  item: { display: 'flex', alignItems: 'flex-start', mt: 0.5 },
  image: (compact: boolean) => ({ width: '100%', maxWidth: compact ? COMPACT_IMAGE_WIDTH : MESSAGE_IMAGE_WIDTH, maxHeight: compact ? COMPACT_IMAGE_HEIGHT : MESSAGE_IMAGE_HEIGHT, borderRadius: 0, objectFit: 'cover', cursor: 'pointer' }),
  download: { display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer', color: 'inherit', p: 0, minWidth: 0 },
  icon: { fontSize: 'inherit', transform: 'rotate(45deg)' },
  label: { color: 'inherit', textDecoration: 'underline', overflowWrap: 'anywhere' },
} as const;
