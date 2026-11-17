import { lazy } from 'react';
import { Navigate, type RouteObject } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import AuthEntryRedirect from './AuthEntryRedirect';
import SchoolAccessGuard from './SchoolAccessGuard';
import SchoolCapabilityGuard from './SchoolCapabilityGuard';
import LegacySchoolRedirect from './LegacySchoolRedirect';
import NotFoundPage from '../Services/NotFound/NotFoundPage';
import ForbiddenPage from '../Services/Forbidden/ForbiddenPage';
import AuthLayout from '../Services/Auth/Pages/AuthLayout/AuthLayout';
import LoginPage from '../Services/Auth/Pages/LoginPage/LoginPage';
import RegisterPage from '../Services/Auth/Pages/RegisterPage/RegisterPage';

const AppShell = lazy(() => import('../Services/AppShell/AppShell'));
const AppEntryPage = lazy(() => import('../Services/AppShell/AppEntryPage'));
const LessonsPage = lazy(() => import('../Services/Schools/LessonsPage/LessonsPage'));
const LessonIdPage = lazy(() => import('../Services/Lessons/LessonIdPage'));
const CallsPage = lazy(() => import('../Services/Schools/CallsPage/CallsPage'));
const FilesPage = lazy(() => import('../Services/Schools/FilesPage/FilesPage'));
const ChatsPage = lazy(() => import('../Services/Schools/ChatsPage/ChatsPage'));
const SchedulePage = lazy(() => import('../Services/Scheduling/SchedulePage'));
const StudentsPage = lazy(() => import('../Services/Schools/StudentsPage/StudentsPage'));
const SchoolsPage = lazy(() => import('../Services/AdminPanel/SchoolsPage/SchoolsPage'));
const TodayPage = lazy(() => import('../Services/Today/TodayPage'));
const ProfilePage = lazy(() => import('../Services/Profile/ProfilePage'));
const OnboardingPage = lazy(() => import('../Services/Onboarding/OnboardingPage'));
const WaitingConfirmationPage = lazy(() => import('../Services/Onboarding/WaitingConfirmationPage'));

const CoursesPage = lazy(() => import('../Services/Courses/CoursesPage'));
const CoursePage = lazy(() => import('../Services/Courses/CoursePage'));
const CourseLessonPage = lazy(() => import('../Services/Courses/CourseLessonPage'));
const HomeworkPage = lazy(() => import('../Services/Homework/HomeworkPage'));
const HomeworkDetailPage = lazy(() => import('../Services/Homework/HomeworkDetailPage'));
const HomeworkEditorPage = lazy(() => import('../Services/Homework/HomeworkEditorPage'));
const HomeworkAttemptPage = lazy(() => import('../Services/Homework/HomeworkAttemptPage'));
const HomeworkReviewPage = lazy(() => import('../Services/Homework/HomeworkReviewPage'));

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <AuthEntryRedirect />,
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      { index: true, element: <AuthEntryRedirect /> },
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
              { path: 'courses', element: <CoursesPage /> },
              { path: 'courses/:coursePublicId', element: <CoursePage /> },
              { path: 'courses/:coursePublicId/lessons/:lessonId', element: <CourseLessonPage /> },
              { path: 'homework', element: <HomeworkPage /> },
              { path: 'homework/:homeworkPublicId', element: <HomeworkDetailPage /> },
              { path: 'homework/:homeworkPublicId/attempts/:attemptPublicId', element: <HomeworkAttemptPage /> },
              { path: 'lessons/:lessonId', element: <LessonIdPage /> },
              { path: 'schedule', element: <SchedulePage /> },
              { path: 'calls', element: <CallsPage /> },
              { path: 'files', element: <FilesPage /> },
              { path: 'chats', element: <ChatsPage /> },
              {
                element: <SchoolCapabilityGuard capability="canTeach" />,
                children: [
                  { path: 'students', element: <StudentsPage /> },
                  { path: 'homework/new', element: <HomeworkEditorPage /> },
                  { path: 'homework/:homeworkPublicId/edit', element: <HomeworkEditorPage /> },
                  { path: 'homework/:homeworkPublicId/attempts/:attemptPublicId/review', element: <HomeworkReviewPage /> },
                ],
              },
            ],
          },
        ],
      },
      { path: '/onboarding', element: <OnboardingPage /> },
      { path: '/onboarding/waiting/:requestPublicId', element: <WaitingConfirmationPage /> },
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
