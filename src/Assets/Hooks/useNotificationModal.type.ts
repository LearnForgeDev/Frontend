import type { ReactElement } from 'react';

export type CleanupFn = () => void;

export type RenderWithClose = (onClose: () => void) => ReactElement;
