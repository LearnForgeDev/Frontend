import { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { routes } from './Router/RouteTree';
import RouteLoadingFallback from './Router/RouteLoadingFallback';

export default function AppRoutes() {
  return <Suspense fallback={<RouteLoadingFallback />}>{useRoutes(routes)}</Suspense>;
}
