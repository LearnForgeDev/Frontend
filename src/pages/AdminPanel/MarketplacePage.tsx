import React from 'react';
import { registry } from '../../services/ServiceRegistry';
import '../../styles/pages/AdminPanel/marketplace.css';
import type { ServiceStatus } from '../../types/serviceTypes';

type MarketplaceService = {
    id: string;
    name: string;
    description: string;
    price: string;
    icon: string;
    status: ServiceStatus;
    features: string[];
    action: string;
};

const STATUS_LABELS: Record<ServiceStatus, string> = {
    active: 'Активен',
    inactive: 'Неактивен',
    configuring: 'Настройка',
    error: 'Ошибка',
    beta: 'Скоро',
};

const MarketplacePage: React.FC = () => {
    const installed = registry.getAll();
    const lessonsService = installed.find((service) => service.id === 'lessons');

    const services: MarketplaceService[] = [
        {
            id: 'lessons',
            name: lessonsService?.name ?? 'Редактор уроков',
            description: 'Полноценный конструктор мультимедийных уроков с интерактивным холстом и встраиванием ресурсов.',
            price: '1490 ₽/мес',
            icon: 'edit_note',
            status: 'active',
            features: ['Бесконечный холст', 'Интеграция PDF и видео'],
            action: 'Управление',
        },
        {
            id: 'video',
            name: 'Видеозвонки',
            description: 'Высококачественные встроенные звонки с демонстрацией экрана и фокусом на студенте.',
            price: '990 ₽/мес',
            icon: 'video_chat',
            status: 'inactive',
            features: ['Качество потока 4K', 'Запись сессий'],
            action: 'Активировать',
        },
        {
            id: 'homework',
            name: 'Домашние задания',
            description: 'Автоматическая доставка заданий и отслеживание оценок для всех ваших студентов.',
            price: '1190 ₽/мес',
            icon: 'assignment_turned_in',
            status: 'active',
            features: ['Движок автопроверки', 'Уведомления для родителей'],
            action: 'Управление',
        },
        {
            id: 'calendar',
            name: 'Синхронизация календаря',
            description: 'Свяжитесь с Google, Outlook и iCal, чтобы автоматически избегать двойных бронирований.',
            price: 'Бесплатно',
            icon: 'sync',
            status: 'inactive',
            features: ['Двусторонняя синхронизация', 'SMS-напоминания'],
            action: 'Добавить',
        },
    ];

    const activeModulesPrice = services
        .filter((service) => service.status === 'active')
        .map((service) => Number.parseInt(service.price, 10) || 0)
        .reduce((sum, value) => sum + value, 0);

    return (
        <div className="admin-page">
            <section className="admin-marketplace-hero admin-card">
                <div className="admin-marketplace-hero-content">
                    <span className="admin-marketplace-pill">Модульная платформа</span>
                    <h1 className="admin-page-title">
                        Создайте свое рабочее пространство.
                        <br />
                        <span>Платите только за то, чем пользуетесь.</span>
                    </h1>
                    <p className="admin-page-description">
                        Ателье растет вместе с вашей студией. Масштабируйте функции по мере роста списка студентов
                        или сохраняйте минималистичный набор для частных уроков.
                    </p>
                </div>
                <div className="admin-marketplace-hero-orbit" aria-hidden="true" />
            </section>

            <div className="admin-marketplace-grid">
                {services.map(service => (
                    <article key={service.id} className="admin-card admin-marketplace-card">
                        <div className="admin-marketplace-card-body">
                            <div className="admin-marketplace-card-header">
                                <div className="admin-marketplace-icon-box">
                                    <span className="material-symbols-outlined">{service.icon}</span>
                                </div>
                                <span className={`admin-chip ${service.status}`}>
                                    {STATUS_LABELS[service.status]}
                                </span>
                            </div>
                            
                            <h3 className="admin-marketplace-card-title">{service.name}</h3>
                            <p className="admin-marketplace-card-desc">
                                {service.description}
                            </p>

                            <ul className="admin-marketplace-feature-list">
                                {service.features.map((feature) => (
                                    <li key={feature} className="admin-marketplace-feature-item">
                                        <span className="material-symbols-outlined">
                                            {service.status === 'active' ? 'check_circle' : 'radio_button_unchecked'}
                                        </span>
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        
                        <div className="admin-marketplace-card-footer">
                            <span className="admin-marketplace-price">{service.price}</span>
                            <button className={`admin-button ${service.status === 'active' ? 'ghost' : 'primary'}`}>
                                {service.action}
                            </button>
                        </div>
                    </article>
                ))}

                <article className="admin-marketplace-coming-soon">
                    <div className="admin-marketplace-coming-soon-icon">
                        <span className="material-symbols-outlined">monitoring</span>
                    </div>
                    <h3>Скоро появится</h3>
                    <p>Продвинутая аналитика и модули отчетности по студентам.</p>
                    <button className="admin-button ghost" type="button">Узнать больше</button>
                </article>

                <article className="admin-marketplace-billing">
                    <h3>Ваш тариф</h3>
                    <div className="admin-marketplace-billing-row">
                        <span>Базовая платформа</span>
                        <span>0 ₽</span>
                    </div>
                    <div className="admin-marketplace-billing-row">
                        <span>2 активных модуля</span>
                        <span>{activeModulesPrice} ₽</span>
                    </div>
                    <div className="admin-marketplace-billing-total">
                        <span>Итого в месяц</span>
                        <strong>{activeModulesPrice} ₽</strong>
                    </div>
                    <button className="admin-button primary" type="button">Управление подписками</button>
                </article>
            </div>

            <section className="admin-marketplace-upgrade admin-card">
                <div>
                    <h3 className="admin-widget-title">Нужно индивидуальное решение для школы?</h3>
                    <p>
                        The Atelier Enterprise предлагает массовое лицензирование студентов, отдельный домен и
                        персонального менеджера для школ с более чем 50 преподавателями.
                    </p>
                    <button className="admin-button ghost" type="button">Связаться со специалистом</button>
                </div>
                <div className="admin-marketplace-upgrade-media" aria-hidden="true" />
            </section>
        </div>
    );
};

export default MarketplacePage;
