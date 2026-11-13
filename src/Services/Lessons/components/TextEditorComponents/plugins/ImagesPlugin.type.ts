import type { ImagePayload } from '../nodes/ImageNode.tsx';

export type InsertImagePayload = Readonly<ImagePayload>;

declare global {
  interface DragEvent {
    rangeOffset?: number;
    rangeParent?: Node;
  }
}
