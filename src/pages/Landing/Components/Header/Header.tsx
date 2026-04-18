import { Box, Typography } from '@mui/material';
import GlowButton from '../GlowButton/GlowButton.tsx';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();
  const handlePress = (): void => {
    navigate('/admin');
  };

  return (
    <Box
      component="header"
      id="home"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        padding: '5rem 1.5rem clamp(3rem, 6vw, 4.5rem)',
        minHeight: '40vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        '@media (max-width:900px)': {
          padding: '3rem 1.25rem clamp(2.75rem, 7vw, 3.75rem)',
        },
        '@media (max-width:640px)': {
          padding: '2.75rem 1rem clamp(2.5rem, 8vw, 3.25rem)',
        },
      }}
    >
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          filter: 'blur(120px)',
          opacity: 0.65,
          pointerEvents: 'none',
          width: '520px',
          height: '520px',
          background: 'var(--hero-glow-left)',
          top: '-140px',
          left: '-120px',
        }}
      />
      <Box
        aria-hidden="true"
        sx={{
          position: 'absolute',
          filter: 'blur(120px)',
          opacity: 0.65,
          pointerEvents: 'none',
          width: '520px',
          height: '520px',
          background: 'var(--hero-glow-right)',
          top: '-100px',
          right: '-180px',
        }}
      />
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.5rem',
          textAlign: 'center',
          maxWidth: '840px',
          width: '100%',
          margin: '0 auto',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            maxWidth: '720px',
            alignItems: 'center',
          }}
        >
          <Typography
            component="h1"
            sx={{
              fontSize: 'clamp(3rem, 5.8vw, 4.9rem)',
              fontWeight: 800,
              margin: '9rem 0 0 0',
              color: 'var(--text)',
              letterSpacing: '-0.025em',
            }}
          >
            LearnForge
          </Typography>
          <Typography
            component="p"
            sx={{
              fontSize: 'clamp(1rem, 2vw, 1.2rem)',
              fontWeight: 600,
              margin: 0,
              color: 'var(--muted-text)',
              maxWidth: '500px',
            }}
          >
            Создавайте и запускайте обучение быстрее, чем когда-либо.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.8rem',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap',
                justifyContent: 'center',
                '@media (max-width:640px)': {
                  flexDirection: 'column',
                  width: '100%',
                },
              }}
            >
              <GlowButton
                type="button"
                onClick={handlePress}
                sx={{
                  '--glow-button-padding': '1.25rem 3.15rem',
                  '--glow-button-font-size': '1.16rem',
                  '--glow-button-radius': '18px',
                  '--glow-button-shadow': 'var(--cta-shadow)',
                  '--glow-button-shadow-hover': 'var(--cta-shadow-hover)',
                  '--glow-button-outline': 'var(--cta-focus-outline)',
                  letterSpacing: '-0.01em',
                  '@media (max-width:640px)': {
                    width: '100%',
                    textAlign: 'center',
                  },
                }}
              >
                Тест Admin panel
              </GlowButton>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
