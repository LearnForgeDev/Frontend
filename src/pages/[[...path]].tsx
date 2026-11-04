import type { GetServerSideProps } from 'next';
import { matchRoutes } from 'react-router-dom';
import AppRoutes from '@/AppRoutes';
import { routes } from '@/Router/RouteTree';

export default AppRoutes;

export const getServerSideProps: GetServerSideProps<{ initialPath: string }> = async ({ resolvedUrl, res }) => {
  res.setHeader('Cache-Control', 'private, no-store');
  const pathname = resolvedUrl.split('?')[0];
  if (pathname === '/' || pathname.toLowerCase() === '/auth') {
    const search = resolvedUrl.slice(pathname.length);
    return { redirect: { destination: `/auth/login${search}`, permanent: false } };
  }
  if (matchRoutes(routes, pathname)?.at(-1)?.route.path === '*') res.statusCode = 404;
  return { props: { initialPath: resolvedUrl } };
};
