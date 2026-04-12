import { Box, Typography } from '@mui/material';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <Box
      component="footer"
      aria-label="Site footer"
      sx={{
        marginTop: 'clamp(2.5rem, 5vw, 3.5rem)',
        padding: '1rem clamp(1rem, 4vw, 2.8rem)',
        background: 'transparent',
        color: 'var(--text)',
        borderTop: '1px solid var(--footer-separator)',
      }}
    >
      <Box
        sx={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          '@media (max-width:640px)': {
            justifyContent: 'center',
            textAlign: 'center',
          },
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.55rem',
            fontWeight: 500,
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
            color: 'var(--muted-text)',
            opacity: 0.85,
            '@media (max-width:640px)': {
              width: '100%',
              justifyContent: 'center',
            },
          }}
        >
          <Typography component="span" sx={{ fontSize: '0.98rem', color: 'inherit' }}>
            {'\u00A9'} {year} {'\u00B7'} learnForge
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
