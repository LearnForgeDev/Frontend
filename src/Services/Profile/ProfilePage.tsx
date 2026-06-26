import React from 'react';
import { Box, Typography, Avatar, Card, CircularProgress, Alert, Paper } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext.ts';
import { schoolsEndpoints } from '@/Endpoints';

const ProfilePage: React.FC = () => {
  const user = useGlobalContext((s) => s.auth.user);

  const { data: schools, isLoading, error } = useQuery({
    queryKey: ['my-schools'],
    queryFn: () => schoolsEndpoints.getMySchools(),
  });

  if (!user) {
    return <Alert severity="error">Пользователь не авторизован</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 4, fontFamily: 'Manrope, sans-serif' }}>
        Мой профиль
      </Typography>

      <Paper sx={{ p: 4, mb: 5, borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.04)' }}>
        <Avatar sx={{ width: 90, height: 90, bgcolor: 'primary.main', fontSize: '2.5rem', fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>
          {user.userName.slice(0, 2).toUpperCase()}
        </Avatar>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: 'Manrope, sans-serif', mb: 0.5 }}>
            {user.userName}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
            Пользователь LearnForge
          </Typography>
        </Box>
      </Paper>

      <Typography variant="h5" sx={{ fontWeight: 800, mb: 3, fontFamily: 'Manrope, sans-serif' }}>
        Мои школы
      </Typography>

      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">Ошибка при загрузке списка школ</Alert>
      ) : schools && schools.length > 0 ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {schools.map((school) => (
            <Card key={school.schoolPublicId} sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.03)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Manrope, sans-serif' }}>
                {school.schoolName}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {school.roles.map((role, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      bgcolor: 'rgba(25, 118, 210, 0.08)',
                      color: 'primary.main',
                      px: 2,
                      py: 0.75,
                      borderRadius: 2,
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      fontFamily: 'Manrope, sans-serif'
                    }}
                  >
                    {role}
                  </Box>
                ))}
              </Box>
            </Card>
          ))}
        </Box>
      ) : (
        <Paper sx={{ p: 4, borderRadius: 3, bgcolor: 'background.default', border: '1px dashed', borderColor: 'divider' }}>
          <Typography color="text.secondary" sx={{ fontWeight: 500, textAlign: 'center' }}>
            Вы не состоите ни в одной школе.
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default ProfilePage;
