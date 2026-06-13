import {useRoutes, type RouteObject, Navigate} from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import LessonsMainPage from './Services/Lessons/LessonsMainPage';
import LessonIdPage from './Services/Lessons/LessonIdPage';
import AdminPanelLayout from './Services/AdminPanel/AdminPanelLayout/AdminPanelLayout';
import DashboardHome from './Services/AdminPanel/DashboardHome/DashboardHome';
import MarketplacePage from './Services/AdminPanel/MarketplacePage';
import SchoolsPage from './Services/AdminPanel/SchoolsPage/SchoolsPage';
import AdminPlaceholder from './Services/AdminPanel/AdminPlaceholder';
import NotFoundPage from './Services/NotFound/NotFoundPage';
import AuthLayout from './Services/Auth/Pages/AuthLayout/AuthLayout.tsx';
import LoginPage from './Services/Auth/Pages/LoginPage/LoginPage.tsx';
import RegisterPage from './Services/Auth/Pages/RegisterPage/RegisterPage.tsx';
import SchoolLayout from './Services/Schools/SchoolLayout/SchoolLayout.tsx';
import SchoolOverviewPage from './Services/Schools/SchoolOverview/SchoolOverviewPage.tsx';

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
          path: "marketplace",
          element: <MarketplacePage />,
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

  return useRoutes(routes);
};

export default AppRoutes;