import type { ScheduleEvent } from '@/Services/Scheduling/Scheduling.types';


export const getCallButtonText = (
    isOpen: boolean,
    event: ScheduleEvent
): string => {
    if (isOpen) {
        return 'Войти';
    }

    const currentUTCTime = new Date().toISOString();

    if (event.start > currentUTCTime) {
        return 'Скоро';
    }

    return 'Завершено';
}