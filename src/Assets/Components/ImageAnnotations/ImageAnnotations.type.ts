import type { PointerEvent } from 'react';

export interface ImageAnnotation {
  publicId: string;
  filePublicId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
}

export interface ImageAnnotationsProps {
  src: string;
  alt: string;
  filePublicId: string;
  annotations: ImageAnnotation[];
  onChange?: (annotations: ImageAnnotation[]) => void;
  readOnly?: boolean;
}

export interface ImagePoint {
  x: number;
  y: number;
}

export interface ImageRectangle extends ImagePoint {
  width: number;
  height: number;
}

export type ImagePointerEvent = PointerEvent<HTMLDivElement>;
