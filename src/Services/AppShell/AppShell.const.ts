import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded';
import Groups2RoundedIcon from '@mui/icons-material/Groups2Rounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import type { AppNavigationItem } from './AppShell.types';

export const APP_SIDEBAR_WIDTH_PX = 272;
export const APP_TOPBAR_HEIGHT_PX = 72;
export const APP_MOBILE_NAV_HEIGHT_PX = 72;
export const APP_CONTENT_MAX_WIDTH_PX = 1440;

export const APP_NAVIGATION_ITEMS: AppNavigationItem[] = [
  {
    id: 'today',
    label: 'Сегодня',
    path: 'today',
    icon: HomeRoundedIcon,
    mobilePriority: true,
  },
  {
    id: 'lessons',
    label: 'Уроки',
    path: 'lessons',
    icon: MenuBookRoundedIcon,
    mobilePriority: true,
  },
  {
    id: 'schedule',
    label: 'Расписание',
    path: 'schedule',
    icon: CalendarMonthRoundedIcon,
    mobilePriority: true,
  },
  {
    id: 'chats',
    label: 'Чаты',
    path: 'chats',
    icon: ChatBubbleOutlineRoundedIcon,
    mobilePriority: true,
  },
  {
    id: 'files',
    label: 'Материалы',
    path: 'files',
    icon: FolderOpenRoundedIcon,
  },
  {
    id: 'students',
    label: 'Ученики',
    path: 'students',
    icon: Groups2RoundedIcon,
    requiredCapability: 'canTeach',
  },
];

export const MORE_NAVIGATION_LABEL = 'Ещё';
