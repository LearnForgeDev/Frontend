import type { ServiceManifest } from '../../types/serviceTypes';
import { LessonsIcon } from '../../assets/images/featureIcons/LessonsIcon';
import { LessonsConfig } from './LessonsConfig';
import { LessonsDashboardWidget } from './LessonsDashboardWidget';

export const lessonsManifest: ServiceManifest = {
    id: 'lessons',
    name: 'Lessons Manager',
    description: 'Create, edit, and organize interactive lessons.',
    icon: <LessonsIcon size={24} />,
    version: '1.0.0',
    adminRoute: 'lessons',
    ConfigComponent: LessonsConfig,
    DashboardWidget: LessonsDashboardWidget,
};
