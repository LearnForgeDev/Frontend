import {
  GAME_CANVAS_HEIGHT,
  GAME_CANVAS_WIDTH,
  GAME_COLORS,
  GAME_DINOSAUR_SIZE,
  GAME_DINOSAUR_X,
  GAME_GROUND_Y,
  GAME_INITIAL_OBSTACLE_X,
  GAME_OBSTACLE_HEIGHT,
  GAME_OBSTACLE_WIDTH,
} from './DinosaurGame.const';
import type { GameState } from './DinosaurGame.types';

export function createGameState(): GameState {
  return {
    dinosaurY: 0,
    velocity: 0,
    obstacleX: GAME_INITIAL_OBSTACLE_X,
    score: 0,
    lastFrameTime: performance.now(),
  };
}

export function drawGame(
  context: CanvasRenderingContext2D,
  game: GameState,
): void {
  context.fillStyle = GAME_COLORS.background;
  context.fillRect(0, 0, GAME_CANVAS_WIDTH, GAME_CANVAS_HEIGHT);

  context.fillStyle = GAME_COLORS.ground;
  context.fillRect(0, GAME_GROUND_Y, GAME_CANVAS_WIDTH, 3);

  const dinosaurTop = GAME_GROUND_Y - GAME_DINOSAUR_SIZE - game.dinosaurY;
  context.fillStyle = GAME_COLORS.dinosaur;
  context.fillRect(
    GAME_DINOSAUR_X,
    dinosaurTop,
    GAME_DINOSAUR_SIZE,
    GAME_DINOSAUR_SIZE,
  );
  context.fillStyle = GAME_COLORS.dinosaurEye;
  context.fillRect(
    GAME_DINOSAUR_X + GAME_DINOSAUR_SIZE - 9,
    dinosaurTop + 7,
    4,
    4,
  );

  context.fillStyle = GAME_COLORS.obstacle;
  context.fillRect(
    game.obstacleX,
    GAME_GROUND_Y - GAME_OBSTACLE_HEIGHT,
    GAME_OBSTACLE_WIDTH,
    GAME_OBSTACLE_HEIGHT,
  );
}

export function hasCollision(game: GameState): boolean {
  const dinosaurRight = GAME_DINOSAUR_X + GAME_DINOSAUR_SIZE;
  const dinosaurBottom = GAME_GROUND_Y - game.dinosaurY;
  const obstacleRight = game.obstacleX + GAME_OBSTACLE_WIDTH;
  const obstacleTop = GAME_GROUND_Y - GAME_OBSTACLE_HEIGHT;

  return (
    dinosaurRight > game.obstacleX &&
    GAME_DINOSAUR_X < obstacleRight &&
    dinosaurBottom > obstacleTop
  );
}
