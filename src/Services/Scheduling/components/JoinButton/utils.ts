export const getCallButtonText = (
  canJoin: boolean,
  isFuture: boolean,
): string => {
  if (canJoin) {
    return 'Войти';
  }

  return isFuture ? 'Скоро' : 'Завершено';
};
