import { useState } from 'react';
import { Box, Button, TextField, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import {
  formCardSx,
  formRowSx,
  headerRowSx,
  hintSx,
  inputSx,
  listCardSx,
  pageSx,
} from './SchoolListPage.styles';

const SchoolListPage = () => {
  const navigate = useNavigate();
  const setActiveSchoolPublicId = useGlobalContext(state => state.auth.setActiveSchoolPublicId);
  const [schoolPublicId, setSchoolPublicId] = useState('');
  const [schoolName, setSchoolName] = useState('');

  const handleOpenSchool = () => {
    const trimmedId = schoolPublicId.trim();
    if (!trimmedId) {
      return;
    }

    setActiveSchoolPublicId(trimmedId);
    navigate(`/admin/schools/${encodeURIComponent(trimmedId)}`, {
      state: { schoolName: schoolName.trim() || `Школа ${trimmedId}` },
    });
  };

  return (
    <Box sx={pageSx} className="admin-page">
      <Box sx={headerRowSx}>
        <Box>
          <Typography component="h1" className="admin-page-title">
            Мои школы
          </Typography>
          <Typography className="admin-page-description">
            Управляйте файлами, чатами и настройками каждой школы в отдельном рабочем пространстве.
          </Typography>
        </Box>
      </Box>

      <Box className="admin-card" sx={formCardSx}>
        <Typography component="h2" sx={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>
          Открыть школу
        </Typography>
        <Box sx={formRowSx}>
          <TextField
            label="Публичный ID школы"
            value={schoolPublicId}
            onChange={(event) => setSchoolPublicId(event.target.value)}
            size="small"
            sx={inputSx}
          />
          <TextField
            label="Название школы"
            value={schoolName}
            onChange={(event) => setSchoolName(event.target.value)}
            size="small"
            sx={inputSx}
          />
          <Button
            variant="contained"
            onClick={handleOpenSchool}
            sx={{ alignSelf: 'center', textTransform: 'none', borderRadius: '0.7rem' }}
          >
            Перейти
          </Button>
        </Box>
        <Typography sx={hintSx}>
          Добавьте список школ после подключения API. Сейчас можно перейти по ID вручную.
        </Typography>
      </Box>

      <Box className="admin-card" sx={listCardSx}>
        <Typography component="h2" sx={{ fontFamily: 'Manrope, sans-serif', fontWeight: 700 }}>
          Список школ
        </Typography>
        <Box className="admin-empty-state">
          <Typography>Школы пока не загружены. Подключите API, чтобы отобразить список.</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default SchoolListPage;
