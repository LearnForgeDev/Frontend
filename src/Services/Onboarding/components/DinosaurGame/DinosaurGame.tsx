import { Box, Button, Typography } from '@mui/material';
import { PulseLoader } from 'react-spinners';
import { useDinosaurGame } from '../../hooks/useDinosaurGame';
import { GAME_ERROR_MESSAGE } from './DinosaurGame.const';
import * as S from './DinosaurGame.styles';

export default function DinosaurGame() {
  const { containerRef, status, prefersReducedMotion, retry } = useDinosaurGame();

  return (
    <Box component="section" aria-label="Динозаврик" sx={S.container}>
      {prefersReducedMotion ? (
        <Typography color="text.secondary">Анимация отключена в настройках системы</Typography>
      ) : (
        <>
          {status === 'loading' && (
            <Box role="status" aria-label="Загружаем игру" sx={S.loading}>
              <PulseLoader color="currentColor" />
            </Box>
          )}
          {status === 'error' && (
            <Box sx={S.error}>
              <Typography color="text.secondary">{GAME_ERROR_MESSAGE}</Typography>
              <Button onClick={retry}>Повторить</Button>
            </Box>
          )}
          <Box ref={containerRef} sx={S.widget} />
        </>
      )}
    </Box>
  );
}
