import { Box, Link, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import GlowButton from '../GlowButton/GlowButton.tsx';

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <Box
      component="nav"
      aria-label="Основная навигация"
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 60,
        background: 'transparent',
        borderBottom: 'none',
        boxShadow: 'none',
      }}
    >
      <Box
        sx={{
          maxWidth: '1200px',
          margin: 'clamp(0rem, 1vw, 0.6rem) auto 0',
          padding: '0.5rem clamp(1rem, 4vw, 2rem)',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr auto', md: '1fr auto 1fr' },
          gridTemplateAreas: {
            xs: '"brand action" "links links"',
            md: '"brand links action"',
          },
          alignItems: 'center',
          gap: '1.25rem',
          rowGap: { xs: '0.4rem', md: 'initial' },
          position: 'relative',
          background: 'var(--landing-nav-bg)',
          backdropFilter: 'blur(20px) saturate(140%)',
          WebkitBackdropFilter: 'blur(20px) saturate(140%)',
          border: '1px solid var(--glass-border-strong)',
          borderRadius: '18px',
          boxShadow: 'var(--landing-nav-shadow)',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            borderRadius: '18px',
            background: 'var(--landing-nav-sheen)',
            opacity: 'var(--landing-nav-sheen-opacity)',
            pointerEvents: 'none',
            mixBlendMode: 'var(--landing-nav-blend-mode)',
          },
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            gridArea: 'brand',
            fontWeight: 900,
            letterSpacing: '-0.02em',
            fontSize: 'clamp(1.28rem, 2.6vw, 1.65rem)',
            color: 'var(--text)',
            justifySelf: 'start',
            position: 'relative',
            zIndex: 1,
          }}
        >
          LearnForge
        </Typography>

        <Stack
          component="div"
          direction="row"
          spacing={{ xs: 1.1, md: 2.5 }}
          sx={{
            gridArea: 'links',
            justifyContent: 'center',
            alignItems: 'center',
            fontWeight: 700,
            fontSize: '1.05rem',
            letterSpacing: '0.01em',
            width: '100%',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {[
            { href: '#home', label: 'Главная' },
            { href: '#features', label: 'Возможности' },
            { href: '#faq', label: 'FAQ' },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              underline="none"
              sx={{
                color: 'var(--text)',
                padding: '0.5rem 0.7rem',
                borderRadius: '10px',
                transition: 'color 0.2s ease, background 0.2s ease',
                '&:hover, &:focus-visible': {
                  color: 'var(--accent)',
                  background: 'var(--selected)',
                },
              }}
            >
              {item.label}
            </Link>
          ))}
        </Stack>

        <Box
          sx={{
            gridArea: 'action',
            justifySelf: 'end',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <GlowButton
            className="nav-login"
            type="button"
            onClick={() => navigate('/auth/login')}
            sx={{
              padding: '0.9rem 1.6rem',
              fontSize: '1.02rem',
              borderRadius: '12px',
              boxShadow: 'var(--nav-login-shadow)',
              backdropFilter: 'blur(var(--blur-amount))',
              transition:
                'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease, background-size 0.35s ease',
            }}
          >
            Войти
          </GlowButton>
        </Box>
      </Box>
    </Box>
  );
}
