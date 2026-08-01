import type { ScheduleEvent } from "../Scheduling/Scheduling.types";

export const getClosestEvent = (
    events: ScheduleEvent[] | undefined
): ScheduleEvent | null => {
    if (!events) {
        return null;
    }

    const timeNow = new Date().getTime();

    let smallestDifference = Infinity;
    let selectedEvent: null | ScheduleEvent = null;
    for (const event of events) {
        const timeOfEvent = new Date(event.start).getTime();
        const difference = timeOfEvent - timeNow;

        if (difference > 0 && difference < smallestDifference) {
            smallestDifference = difference;
            selectedEvent = event;
        }
    }

    return selectedEvent;
}