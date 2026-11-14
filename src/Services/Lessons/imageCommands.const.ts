import { createCommand } from 'lexical';
import type { LexicalCommand } from 'lexical';
import type { ResizeImagePayload } from './components/TextEditorComponents/nodes/ImageNode.type';

export const RESIZE_IMAGE_COMMAND: LexicalCommand<ResizeImagePayload> = createCommand('RESIZE_IMAGE_COMMAND');
