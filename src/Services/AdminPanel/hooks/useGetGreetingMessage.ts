import { useUser } from "@/Storage/UserContext/UserContext";
import { getTimeOfDay } from "@/Services/AdminPanel/utils";

export const useGetGreetingMessage = (): string => {
    const { user } = useUser()

    const timeOfDay = getTimeOfDay();
    const enToRuTimeOfDay: Record<string, string> = {
        "morning": "Доброе утро",
        "day": "Добрый день",
        "evening": "Добрый вечер",
        "night": "Доброй ночи",
    }

    return `${enToRuTimeOfDay[timeOfDay]}${user?.userName ? ', ' + user.userName : ''}!`;
}