export type GameStatus = 'gameover' | 'paused' | 'reduced' | 'running';

export type GameState = {
  dinosaurY: number;
  velocity: number;
  obstacleX: number;
  score: number;
  lastFrameTime: number;
};
