import type { GameStatus } from './DinosaurGame.types';

export const GAME_CANVAS_WIDTH = 640;
export const GAME_CANVAS_HEIGHT = 220;
export const GAME_GROUND_Y = 178;
export const GAME_DINOSAUR_X = 72;
export const GAME_DINOSAUR_SIZE = 34;
export const GAME_OBSTACLE_WIDTH = 22;
export const GAME_OBSTACLE_HEIGHT = 42;
export const GAME_INITIAL_OBSTACLE_X = 520;
export const GAME_MIN_OBSTACLE_GAP = 220;
export const GAME_RANDOM_OBSTACLE_GAP = 240;
export const GAME_GRAVITY = 1_850;
export const GAME_JUMP_VELOCITY = 670;
export const GAME_SPEED = 280;
export const GAME_MAX_FRAME_SECONDS = 0.034;
export const GAME_SCORE_FACTOR = 10;

export const GAME_COLORS = {
  background: '#fffaf1',
  ground: '#d8cbb8',
  dinosaur: '#315f54',
  dinosaurEye: '#fffaf1',
  obstacle: '#d78655',
  text: '#27322f',
};

export const GAME_STATUS_TEXT: Record<GameStatus, string> = {
  gameover: 'Столкновение — нажмите, чтобы начать заново',
  paused: 'Пауза',
  reduced: 'Анимация отключена в настройках системы',
  running: 'Пробел, клик или касание — прыжок',
};
