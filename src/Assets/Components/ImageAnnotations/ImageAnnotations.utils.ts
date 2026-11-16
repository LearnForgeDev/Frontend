import type { ImagePoint, ImageRectangle } from './ImageAnnotations.type';

export function imagePoint(client: ImagePoint, bounds: Pick<DOMRect, 'left' | 'top' | 'width' | 'height'>): ImagePoint {
  return {
    x: Math.max(0, Math.min(1, (client.x - bounds.left) / Math.max(1, bounds.width))),
    y: Math.max(0, Math.min(1, (client.y - bounds.top) / Math.max(1, bounds.height))),
  };
}

export function imageRectangle(start: ImagePoint, end: ImagePoint): ImageRectangle {
  const x = Math.min(start.x, end.x, 0.99);
  const y = Math.min(start.y, end.y, 0.99);
  return { x, y, width: Math.min(1 - x, Math.max(0.01, Math.abs(end.x - start.x))), height: Math.min(1 - y, Math.max(0.01, Math.abs(end.y - start.y))) };
}

export function boundRectangle(rectangle: ImageRectangle): ImageRectangle {
  const x = Math.max(0, Math.min(0.99, rectangle.x));
  const y = Math.max(0, Math.min(0.99, rectangle.y));
  return { x, y, width: Math.max(0.01, Math.min(1 - x, rectangle.width)), height: Math.max(0.01, Math.min(1 - y, rectangle.height)) };
}
