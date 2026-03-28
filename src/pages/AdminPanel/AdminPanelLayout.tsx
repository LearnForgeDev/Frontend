import React, { useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { serviceRegistry } from '../../services/ServiceRegistry';
import type { ServiceManifest } from '../../types/serviceTypes.ts';
import './layout.css';

const AdminPanelLayout: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [services] = useState<ServiceManifest[]>(serviceRegistry.getAll());
    const location = useLocation();

    const pageTitle = useMemo(() => {
        if (location.pathname.includes('/marketplace')) {
            return 'Marketplace';
        }

        if (location.pathname.includes('/services/')) {
            const [route] = location.pathname.split('/services/');
            const service = services.find((item) => item.adminRoute === route);
            return service?.name ?? 'Service';
        }

        return 'Dashboard';
    }, [location.pathname, services]);

    const closeMenu = () => setIsMenuOpen(false);

    return (
        <div className="admin-layout">
            <button
                type="button"
                className="admin-mobile-menu-button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
            >
                Menu
            </button>

            {isMenuOpen ? (
                <button type="button" className="admin-sidebar-backdrop" onClick={closeMenu} aria-label="Close menu" />
            ) : null}

            <aside className={`admin-sidebar ${isMenuOpen ? 'is-open' : ''}`}>
                <div className="admin-sidebar-header">
                    <h2 className="admin-sidebar-title">
                        <span className="admin-sidebar-logo material-symbols-outlined">brush</span>
                        The Atelier
                    </h2>
                    <p className="admin-sidebar-subtitle">Обучающее пространство</p>
                </div>
                
                <nav className="admin-nav">
                    <div className="admin-nav-section-title">Platform</div>

                    <NavLink 
                        to="/admin" 
                        end
                        onClick={closeMenu}
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="admin-nav-link-icon material-symbols-outlined">dashboard</span>
                        <span>Панель управления</span>
                    </NavLink>
                    
                    <NavLink 
                        to="/admin/marketplace" 
                        onClick={closeMenu}
                        className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="admin-nav-link-icon material-symbols-outlined">storefront</span>
                        <span>Сервисы</span>
                    </NavLink>

                    <span className="admin-nav-link" aria-disabled="true">
                        <span className="admin-nav-link-icon material-symbols-outlined">assignment</span>
                        <span>Домашние задания</span>
                    </span>

                    <span className="admin-nav-link" aria-disabled="true">
                        <span className="admin-nav-link-icon material-symbols-outlined">calendar_today</span>
                        <span>Календарь</span>
                    </span>

                    <span className="admin-nav-link" aria-disabled="true">
                        <span className="admin-nav-link-icon material-symbols-outlined">group</span>
                        <span>Студенты</span>
                    </span>
                    
                    <div className="admin-nav-section-title margin-top">
                        Services
                    </div>
                    
                    {services
                        .filter(service => service.isBought && service.isEnabled)
                        .map(service => (
                        <NavLink 
                            key={service.id}
                            to={`services/${service.adminRoute}`}
                            onClick={closeMenu}
                            className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
                        >
                            {({ isActive }) => (
                                <>
                                    <span className={`admin-nav-link-icon ${isActive ? 'active' : ''}`} aria-hidden="true">
                                        {service.icon}
                                    </span>
                                    <span>{service.name}</span>
                                </>
                            )}
                        </NavLink>
                    ))}
                </nav>

                <div className="admin-sidebar-footer">
                    <NavLink to="/" onClick={closeMenu} className="admin-back-link">
                        <span className="material-symbols-outlined">arrow_back</span>
                        Return to site
                    </NavLink>
                </div>
            </aside>

            <header className="admin-topbar">
                <div className="admin-topbar-crumbs">
                    <span>Рабочее пространство</span>
                    <span className="material-symbols-outlined">chevron_right</span>
                    <strong>{pageTitle}</strong>
                </div>
                <div className="admin-topbar-right">
                    <label className="admin-search" aria-label="Search modules">
                        <span className="material-symbols-outlined">search</span>
                        <input type="search" placeholder="Поиск модулей..." />
                    </label>
                    <button type="button" className="admin-icon-button" aria-label="Notifications">
                        <span className="material-symbols-outlined">notifications</span>
                    </button>
                    <button type="button" className="admin-icon-button" aria-label="Settings">
                        <span className="material-symbols-outlined">settings</span>
                    </button>
                    <span className="admin-avatar" aria-hidden="true">AT</span>
                </div>
            </header>

            <main className="admin-main-content">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminPanelLayout;
