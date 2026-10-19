import { useEffect, useReducer, useRef } from 'react';
import { useMediaQuery, useTheme } from '@mui/material';
import type { Game404Instance } from '404game';
import { ToastSeverity, useToastStore } from '@/Storage/useToastStore';
import { GAME_CANVAS_HEIGHT, GAME_ERROR_MESSAGE, loadDinosaurGame } from '../components/DinosaurGame/DinosaurGame.const';

type GameLoadState = { status: 'loading' | 'ready' | 'error'; attempt: number };
type GameLoadAction = 'ready' | 'error' | 'retry';

function loadReducer(state: GameLoadState, action: GameLoadAction): GameLoadState {
  return action === 'retry'
    ? { status: 'loading', attempt: state.attempt + 1 }
    : { ...state, status: action };
}

export function useDinosaurGame() {
  const containerRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [{ status, attempt }, dispatch] = useReducer(loadReducer, { status: 'loading', attempt: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container || prefersReducedMotion) return;

    let cancelled = false;
    let instance: Game404Instance | undefined;

    loadDinosaurGame().then(({ default: game }) => {
      if (cancelled) return;
      instance = game.mount(container, {
        game: 'dino',
        height: GAME_CANVAS_HEIGHT,
        message: 'Динозаврик',
        subMessage: 'Пробел или касание — прыжок',
        theme: {
          bg: theme.palette.background.paper,
          fg: theme.palette.text.primary,
          accent: theme.palette.primary.main,
          danger: theme.palette.error.main,
          muted: theme.palette.text.secondary,
          font: theme.typography.fontFamily ?? getComputedStyle(container).fontFamily,
        },
        onStart: () => container.querySelector('canvas')?.focus(),
      });
      dispatch('ready');
    }).catch(() => {
      if (cancelled) return;
      container.replaceChildren();
      dispatch('error');
      useToastStore.getState().addToast(GAME_ERROR_MESSAGE, ToastSeverity.ERROR);
    });

    return () => {
      cancelled = true;
      instance?.destroy();
    };
  }, [attempt, prefersReducedMotion, theme]);

  return { containerRef, status, prefersReducedMotion, retry: () => dispatch('retry') };
}
