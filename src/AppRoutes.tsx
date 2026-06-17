import { lazy, Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { Navigate, useRoutes, type RouteObject } from 'react-router-dom';

const PublicLayout = lazy(() => import('./layouts/PublicLayout'));
const LessonsMainPage = lazy(() => import('./Services/Lessons/LessonsMainPage'));
const LessonIdPage = lazy(() => import('./Services/Lessons/LessonIdPage'));
const AdminPanelLayout = lazy(() => import('./Services/AdminPanel/AdminPanelLayout/AdminPanelLayout'));
const DashboardHome = lazy(() => import('./Services/AdminPanel/DashboardHome/DashboardHome'));
const MarketplacePage = lazy(() => import('./Services/Schools/MarketplacePage/MarketplacePage'));
const SchoolsPage = lazy(() => import('./Services/AdminPanel/SchoolsPage/SchoolsPage'));
const AdminPlaceholder = lazy(() => import('./Services/AdminPanel/AdminPlaceholder'));
const NotFoundPage = lazy(() => import('./Services/NotFound/NotFoundPage'));
const AuthLayout = lazy(() => import('./Services/Auth/Pages/AuthLayout/AuthLayout.tsx'));
const LoginPage = lazy(() => import('./Services/Auth/Pages/LoginPage/LoginPage.tsx'));
const RegisterPage = lazy(() => import('./Services/Auth/Pages/RegisterPage/RegisterPage.tsx'));
const SchoolLayout = lazy(() => import('./Services/Schools/SchoolLayout/SchoolLayout.tsx'));
const SchoolOverviewPage = lazy(() => import('./Services/Schools/SchoolOverview/SchoolOverviewPage.tsx'));
const CallsPage = lazy(() => import('./Services/Schools/CallsPage/CallsPage.tsx'));
const LessonsPage = lazy(() => import('./Services/Schools/LessonsPage/LessonsPage.tsx'));

const AppRoutes = () => {
  const routes: RouteObject[] = [
    {
      element: <PublicLayout />,
      children: [
        {
          path: "/",
          element: <Navigate to="/auth/login"/>,
        },
        {
          path: "/Lessons",
          element: <LessonsMainPage />,
        },
        {
          path: "/Lessons/:lessonId",
          element: <LessonIdPage />,
        },
      ],
    },
    {
      path: "/admin",
      element: <AdminPanelLayout />,
      children: [
        {
          index: true,
          element: <DashboardHome />,
        },
        {
          path: "schools",
          element: <SchoolsPage />,
        },
        {
          path: "services/*",
          element: <AdminPlaceholder />,
        },
      ],
    },
    {
      path: "/admin/schools/:schoolPublicId",
      element: <SchoolLayout />,
      children: [
        {
          index: true,
          element: <SchoolOverviewPage />,
        },
        {
          path: "calls",
          element: <CallsPage />,
        },
        {
          path: "lessons",
          element: <LessonsPage />,
        },
        {
          path: "marketplace",
          element: <MarketplacePage />,
        },
        {
          path: "lessons/:lessonId",
          element: <LessonIdPage />,
        },
      ],
    },
    {
      path: "/auth",
      element: <AuthLayout />,
      children: [
        {
          path: "login",
          element: <LoginPage />,
        },
        {
          path: "register",
          element: <RegisterPage />,
        },
      ],
    },
    {
      path: "*",
      element: <NotFoundPage />,
    },
  ];

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      {useRoutes(routes)}
    </Suspense>
  );
};

export default AppRoutes;

const RouteLoadingFallback = () => (
  <Box
    role="status"
    aria-live="polite"
    sx={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      px: 3,
    }}
  >
    <CircularProgress />
    <Typography color="text.secondary">Загрузка раздела…</Typography>
  </Box>
);
