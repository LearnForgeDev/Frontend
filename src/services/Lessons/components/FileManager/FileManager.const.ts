export const FILE_MANAGER_CONSTANTS = {
  LESSON_CARD_WIDTH: 240,
  DEBOUNCE_DELAY: 300,
  DEFAULT_FOLDER_COLOR: '#1976d2',
} as const;

export const SORT_OPTIONS = [
  { value: 'title', label: 'Название' },
  { value: 'status', label: 'Статус' },
] as const;
