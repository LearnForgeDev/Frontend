import React from 'react';
import { Box, Typography } from '@mui/material';

import { useGetGreetingMessage } from '@/Services/AdminPanel/hooks/useGetGreetingMessage';
import { getTimeOfDay, getGradient } from '@/Services/AdminPanel/utils';
import { useWindowScroll } from 'react-use';
import { gradientFadeIn, textSlideUp, gradientPulse } from './DashboardHome.const';

const DashboardHome: React.FC = () => {
  const { y } = useWindowScroll();
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
    </Box>
  );
};

export default DashboardHome;