import { lazy } from 'react';

export const LazyDinosaurGame = lazy(
  () => import('./components/DinosaurGame/DinosaurGame'),
);
