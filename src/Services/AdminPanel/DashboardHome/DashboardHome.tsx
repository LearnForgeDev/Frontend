import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';

import { useActiveSchoolRequests } from '@/Services/AdminPanel/hooks/useActiveSchoolRequests';
import { useGetGreetingMessage } from '@/Services/AdminPanel/hooks/useGetGreetingMessage';
import { getTimeOfDay, getGradient } from '@/Services/AdminPanel/utils';
import { useWindowScroll } from 'react-use';
import { gradientFadeIn, textSlideUp, widgetFadeIn, gradientPulse } from './DashboardHome.const';

const DashboardHome: React.FC = () => {
  const { requests, isLoading: isLoadingRequests } = useActiveSchoolRequests();
  const { y } = useWindowScroll();

  const hasAnyContent = requests.length > 0;
  const greetingMessage = useGetGreetingMessage();

  const dynamicFontSize = Math.max(2.5, 5 - y / 80);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        position: 'relative',
        zIndex: 0,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-15rem',
          left: '-30rem',
          right: '-15rem',
          height: '80vh',
          background: getGradient(getTimeOfDay()),
          zIndex: -1,
          pointerEvents: 'none',
          transformOrigin: 'top left',
          animation: `${gradientFadeIn} 1.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards, ${gradientPulse} 10s ease-in-out infinite 1.5s`,
        }
      }}
    >
      <Box>
        <Box sx={{ animation: `${textSlideUp} 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`, opacity: 0 }}>
          <Typography
            component="h1"
            sx={{
              marginTop: '20vh',
              color: "var(--admin-text)",
              fontFamily: "Manrope, sans-serif",
              fontSize: `${dynamicFontSize}rem`,
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            {greetingMessage}
          </Typography>
          <Typography
            sx={{
              color: "var(--admin-muted)",
              maxWidth: "680px",
              fontSize: "1.5rem",
            }}
          >
            С чего сегодня начнем?
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "1rem",
          minHeight: "150px",
          animation: `${widgetFadeIn} 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) 0.3s forwards`,
          opacity: 0,
        }}
      >
        {isLoadingRequests ? (
          <Skeleton variant="rounded" width="100%" height={150} sx={{ borderRadius: '1.5rem' }} />
        ) : !hasAnyContent ? (
          <WidgetsPlaceholder />
        ) : null}
      </Box>
    </Box>
  );
};

export default DashboardHome;

const WidgetsPlaceholder = () => {
  return (
    <Box
      sx={{
        border: "1px dashed var(--admin-outline)",
        borderRadius: "1.5rem",
        background: "var(--admin-surface)",
        padding: "1.75rem",
        color: "var(--admin-muted)",
        minHeight: "150px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      <Typography
        component="h3"
        sx={{
          margin: 0,
          color: "var(--admin-text)",
          fontFamily: "Manrope, sans-serif",
        }}
      >
        Пока нет виджетов сервисов
      </Typography>
      <Typography sx={{ marginTop: "0.35rem" }}>
        Установите и активируйте сервисы в Маркетплейсе, чтобы отображать здесь операционные метрики.
      </Typography>
    </Box>
  );
};