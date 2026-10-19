import AccessTimeRounded from '@mui/icons-material/AccessTimeRounded';
import CheckCircleOutlineRounded from '@mui/icons-material/CheckCircleOutlineRounded';
import ErrorOutlineRounded from '@mui/icons-material/ErrorOutlineRounded';
import type { SchoolRequestViewState } from '../../utils/schoolRequestStatus.utils';

export const SCHOOL_REQUEST_STATUS_CONTENT: Record<
  SchoolRequestViewState,
  { Icon: typeof AccessTimeRounded; title: string; description: string }
> = {
  pending: {
    Icon: AccessTimeRounded,
    title: 'Заявка на рассмотрении',
    description: 'Можно закрыть страницу и вернуться позже. Если присоединитесь к другой школе, текущая заявка останется активной.',
  },
  approved: {
    Icon: CheckCircleOutlineRounded,
    title: 'Школа готова',
    description: 'Открываем ваше новое пространство.',
  },
  provisioning: {
    Icon: AccessTimeRounded,
    title: 'Готовим школу',
    description: 'Подтверждение получено. Настраиваем ваше пространство.',
  },
  rejected: {
    Icon: ErrorOutlineRounded,
    title: 'Заявку не удалось подтвердить',
    description: 'Проверьте название и отправьте новую заявку.',
  },
};
