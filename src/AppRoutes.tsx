import { useRoutes, type RouteObject } from 'react-router-dom';
import PublicLayout from './layouts/PublicLayout';
import Landing from './pages/Landing/Landing';
import LessonsMainPage from './pages/Lessons/LessonsMainPage';
import LessonIdPage from './pages/Lessons/LessonIdPage';
import AdminPanelLayout from './pages/AdminPanel/AdminPanelLayout/AdminPanelLayout';
import DashboardHome from './pages/AdminPanel/DashboardHome/DashboardHome';
import MarketplacePage from './pages/AdminPanel/MarketplacePage';
import AdminPlaceholder from './pages/AdminPanel/AdminPlaceholder';
import NotFoundPage from './pages/NotFound/NotFoundPage';
import AuthLayout from './pages/Auth/Pages/AuthLayout/AuthLayout.tsx';
import LoginPage from './pages/Auth/Pages/LoginPage/LoginPage.tsx';
import RegisterPage from './pages/Auth/Pages/RegisterPage/RegisterPage.tsx';

const AppRoutes = () => {
    const routes: RouteObject[] = [
        {
            element: <PublicLayout />,
            children: [
                {
                    path: '/',
                    element: <Landing />,
                },
                {
                    path: '/Lessons',
                    element: <LessonsMainPage />,
                },
                {
                    path: '/Lessons/:lessonId',
                    element: <LessonIdPage />,
                },
            ]
        },
        {
            path: '/admin',
            element: <AdminPanelLayout />,
            children: [
                {
                    index: true,
                    element: <DashboardHome />
                },
                {
                    path: 'marketplace',
                    element: <MarketplacePage />
                },
                {
                    path: 'services/*',
                    element: <AdminPlaceholder />
                }
            ]
        },
        {
            path: '/auth',
            element: <AuthLayout />,
            children: [
                {
                    path: 'login',
                    element: <LoginPage />
                },
                {
                    path: 'register',
                    element: <RegisterPage />
                }
            ]
        },
        {
            path: '*',
            element: <NotFoundPage />
        }
    ];

    return useRoutes(routes);
};

export default AppRoutes;
