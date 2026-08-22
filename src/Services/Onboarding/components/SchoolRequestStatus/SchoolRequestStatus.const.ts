import type { SchoolRequestViewState } from '../../utils/schoolRequestStatus.utils';

export const SCHOOL_REQUEST_STATUS_CONTENT: Record<
  SchoolRequestViewState,
  { symbol: string; title: string; description: string }
> = {
  pending: {
    symbol: '…',
    title: 'Заявка на рассмотрении',
    description: 'Можно закрыть страницу — ожидание продолжится после возвращения.',
  },
  approved: {
    symbol: '✓',
    title: 'Школа готова',
    description: 'Открываем ваше новое пространство.',
  },
  provisioning: {
    symbol: '…',
    title: 'Готовим школу',
    description: 'Подтверждение получено. Настраиваем ваше пространство.',
  },
  rejected: {
    symbol: '!',
    title: 'Заявку не удалось подтвердить',
    description: 'Проверьте название и отправьте новую заявку.',
  },
};
