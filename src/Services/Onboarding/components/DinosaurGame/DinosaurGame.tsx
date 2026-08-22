import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import {
  GAME_CANVAS_HEIGHT,
  GAME_CANVAS_WIDTH,
  GAME_GRAVITY,
  GAME_JUMP_VELOCITY,
  GAME_MAX_FRAME_SECONDS,
  GAME_MIN_OBSTACLE_GAP,
  GAME_OBSTACLE_WIDTH,
  GAME_RANDOM_OBSTACLE_GAP,
  GAME_SCORE_FACTOR,
  GAME_SPEED,
  GAME_STATUS_TEXT,
} from './DinosaurGame.const';
import type { GameState, GameStatus } from './DinosaurGame.types';
import {
  createGameState,
  drawGame,
  hasCollision,
} from './DinosaurGame.utils';
import * as S from './DinosaurGame.styles';

export default function DinosaurGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<GameState>(createGameState());
  const statusRef = useRef<GameStatus>('running');
  const [status, setStatus] = useState<GameStatus>('running');
  const [score, setScore] = useState(0);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  const updateStatus = (nextStatus: GameStatus) => {
    statusRef.current = nextStatus;
    setStatus(nextStatus);
  };

  const restart = () => {
    gameRef.current = createGameState();
    setScore(0);
    updateStatus('running');
    canvasRef.current?.focus();
  };

  const jump = () => {
    if (prefersReducedMotion) {
      return;
    }

    if (statusRef.current === 'gameover') {
      restart();
      return;
    }

    if (statusRef.current === 'running' && gameRef.current.dinosaurY === 0) {
      gameRef.current.velocity = GAME_JUMP_VELOCITY;
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      jump();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) {
      return;
    }

    canvas.focus();
    drawGame(context, gameRef.current);

    if (prefersReducedMotion) {
      return;
    }

    let animationFrameId = 0;

    const frame = (currentTime: number) => {
      const game = gameRef.current;
      const elapsed = Math.min(
        (currentTime - game.lastFrameTime) / 1_000,
        GAME_MAX_FRAME_SECONDS,
      );
      game.lastFrameTime = currentTime;

      if (statusRef.current === 'running') {
        game.velocity -= GAME_GRAVITY * elapsed;
        game.dinosaurY = Math.max(
          0,
          game.dinosaurY + game.velocity * elapsed,
        );
        if (game.dinosaurY === 0) {
          game.velocity = 0;
        }

        game.obstacleX -= GAME_SPEED * elapsed;
        if (game.obstacleX < -GAME_OBSTACLE_WIDTH) {
          game.obstacleX =
            GAME_CANVAS_WIDTH +
            GAME_MIN_OBSTACLE_GAP +
            Math.random() * GAME_RANDOM_OBSTACLE_GAP;
        }

        game.score += elapsed * GAME_SCORE_FACTOR;
        setScore(Math.floor(game.score));

        if (hasCollision(game)) {
          updateStatus('gameover');
        }
      }

      drawGame(context, game);
      animationFrameId = requestAnimationFrame(frame);
    };

    const handleVisibilityChange = () => {
      if (document.hidden && statusRef.current === 'running') {
        updateStatus('paused');
        return;
      }

      if (!document.hidden && statusRef.current === 'paused') {
        gameRef.current.lastFrameTime = performance.now();
        updateStatus('running');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    animationFrameId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(animationFrameId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [prefersReducedMotion]);

  const visibleStatus = prefersReducedMotion ? 'reduced' : status;
  const statusText = GAME_STATUS_TEXT[visibleStatus];

  return (
    <Box sx={S.container}>
      <Box sx={S.header}>
        <Typography sx={S.title}>Динозаврик</Typography>
        <Typography sx={S.score}>Счёт: {score}</Typography>
      </Box>
      <Box
        component="canvas"
        ref={canvasRef}
        width={GAME_CANVAS_WIDTH}
        height={GAME_CANVAS_HEIGHT}
        tabIndex={0}
        role="application"
        aria-label="Игра Динозаврик"
        onPointerDown={jump}
        onKeyDown={handleKeyDown}
        sx={S.canvas}
      />
      <Typography variant="caption" sx={S.hint} aria-live="polite">
        {statusText}
      </Typography>
    </Box>
  );
}
