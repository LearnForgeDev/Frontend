import type {ServiceManifest} from "../types/serviceTypes.ts";

export async function getServicesFromServer(): Promise<ServiceManifest[]> {
    return new Promise(
        resolve => { setTimeout(() => resolve(mockServices), 2000) }
    )
}

const mockServices: ServiceManifest[] = [
    {
        id: 'lessons',
        adminRoute: 'lessons',
        name: 'Редактор уроков',
        description: 'Полноценный конструктор мультимедийных уроков с интерактивным холстом и встраиванием ресурсов.',
        price: 1490,
        icon: 'edit_note',
        isEnabled: true,
        isBought: true,
        features: ['Бесконечный холст', 'Интеграция PDF и видео'],
    },
    {
        id: 'video',
        adminRoute: 'video',
        name: 'Видеозвонки',
        description: 'Высококачественные встроенные звонки с демонстрацией экрана и фокусом на студенте.',
        price: 990,
        icon: 'video_chat',
        isEnabled: false,
        isBought: false,
        features: ['Качество потока 4K', 'Запись сессий'],
    },
    {
        id: 'homework',
        adminRoute: 'homework',
        name: 'Домашние задания',
        description: 'Автоматическая доставка заданий и отслеживание оценок для всех ваших студентов.',
        price: 1190,
        icon: 'assignment_turned_in',
        isEnabled: false,
        isBought: true,
        features: ['Движок автопроверки', 'Уведомления для родителей'],
    },
    {
        id: 'calendar',
        adminRoute: 'calendar',
        name: 'Синхронизация календаря',
        description: 'Свяжитесь с Google, Outlook и iCal, чтобы автоматически избегать двойных бронирований.',
        price: 0,
        icon: 'sync',
        isBought: false,
        isEnabled: false,
        features: ['Двусторонняя синхронизация', 'SMS-напоминания'],
    },
];