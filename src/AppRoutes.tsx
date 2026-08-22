import { lazy, Suspense } from 'react';
import { Navigate, useRoutes, type RouteObject } from 'react-router-dom';
import ProtectedRoute from './Router/ProtectedRoute';
import SchoolAccessGuard from './Router/SchoolAccessGuard';
import SchoolCapabilityGuard from './Router/SchoolCapabilityGuard';
import LegacySchoolRedirect from './Router/LegacySchoolRedirect';
import RouteLoadingFallback from './Router/RouteLoadingFallback';

const AppShell = lazy(() => import('./Services/AppShell/AppShell'));
const AppEntryPage = lazy(() => import('./Services/AppShell/AppEntryPage'));
const LessonsPage = lazy(() => import('./Services/Schools/LessonsPage/LessonsPage'));
const LessonIdPage = lazy(() => import('./Services/Lessons/LessonIdPage'));
const NotFoundPage = lazy(() => import('./Services/NotFound/NotFoundPage'));
const ForbiddenPage = lazy(() => import('./Services/Forbidden/ForbiddenPage'));
const AuthLayout = lazy(() => import('./Services/Auth/Pages/AuthLayout/AuthLayout'));
const LoginPage = lazy(() => import('./Services/Auth/Pages/LoginPage/LoginPage'));
const RegisterPage = lazy(() => import('./Services/Auth/Pages/RegisterPage/RegisterPage'));
const CallsPage = lazy(() => import('./Services/Schools/CallsPage/CallsPage'));
const FilesPage = lazy(() => import('./Services/Schools/FilesPage/FilesPage'));
const ChatsPage = lazy(() => import('./Services/Schools/ChatsPage/ChatsPage'));
const SchedulePage = lazy(() => import('./Services/Scheduling/SchedulePage'));
const StudentsPage = lazy(() => import('./Services/Schools/StudentsPage/StudentsPage'));
const SchoolsPage = lazy(() => import('./Services/AdminPanel/SchoolsPage/SchoolsPage'));
const TodayPage = lazy(() => import('./Services/Today/TodayPage'));
const ProfilePage = lazy(() => import('./Services/Profile/ProfilePage'));
const OnboardingPage = lazy(() => import('./Services/Onboarding/OnboardingPage'));
const WaitingConfirmationPage = lazy(() => import('./Services/Onboarding/WaitingConfirmationPage'));
const DeveloperRequestsPage = lazy(() => import('./Services/Developer/DeveloperRequestsPage'));

export default function AppRoutes() {
  const routes: RouteObject[] = [
    {
      path: '/',
      element: <Navigate to="/auth/login" replace />,
    },
    {
      path: '/auth',
      element: <AuthLayout />,
      children: [
        { index: true, element: <Navigate to="login" replace /> },
        { path: 'login', element: <LoginPage /> },
        { path: 'register', element: <RegisterPage /> },
      ],
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          path: '/app',
          element: <AppShell />,
          children: [
            { index: true, element: <AppEntryPage /> },
            { path: 'schools', element: <SchoolsPage /> },
            { path: 'profile', element: <ProfilePage /> },
            {
              path: 'schools/:schoolPublicId',
              element: <SchoolAccessGuard />,
              children: [
                { index: true, element: <Navigate to="today" replace /> },
                { path: 'today', element: <TodayPage /> },
                { path: 'lessons', element: <LessonsPage /> },
                { path: 'lessons/:lessonId', element: <LessonIdPage /> },
                { path: 'schedule', element: <SchedulePage /> },
                { path: 'calls', element: <CallsPage /> },
                { path: 'files', element: <FilesPage /> },
                { path: 'chats', element: <ChatsPage /> },
                {
                  element: <SchoolCapabilityGuard capability="canTeach" />,
                  children: [{ path: 'students', element: <StudentsPage /> }],
                },
              ],
            },
          ],
        },
        { path: '/onboarding', element: <OnboardingPage /> },
        { path: '/onboarding/waiting/:requestPublicId', element: <WaitingConfirmationPage /> },
        { path: '/developer', element: <DeveloperRequestsPage /> },
        { path: '/admin', element: <Navigate to="/app" replace /> },
        { path: '/admin/schools/:schoolPublicId/*', element: <LegacySchoolRedirect /> },
        { path: '/profile', element: <Navigate to="/app/profile" replace /> },
        { path: '/Lessons', element: <Navigate to="/app" replace /> },
        { path: '/Lessons/:lessonId', element: <Navigate to="/app" replace /> },
      ],
    },
    { path: '/403', element: <ForbiddenPage /> },
    { path: '*', element: <NotFoundPage /> },
  ];

  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      {useRoutes(routes)}
    </Suspense>
  );
}
