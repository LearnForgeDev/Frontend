import React from 'react';
import { registry } from '../../services/ServiceRegistry';
import '../../styles/pages/AdminPanel/dashboard.css';

const DashboardHome: React.FC = () => {
    const services = registry.getAll();
    const widgetServices = services.filter((service) => Boolean(service.DashboardWidget));

    return (
        <div className="admin-page">
            <header className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Dashboard</h1>
                    <p className="admin-page-description">Live status of services, users, and platform health.</p>
                </div>
                <button type="button" className="admin-button">Refresh</button>
            </header>

            <section className="admin-dashboard-kpi-grid">
                <article className="admin-card admin-kpi-card">
                    <p className="admin-kpi-label">Installed Services</p>
                    <p className="admin-kpi-value">{services.length}</p>
                </article>
                <article className="admin-card admin-kpi-card">
                    <p className="admin-kpi-label">Healthy Services</p>
                    <p className="admin-kpi-value">{services.length}</p>
                </article>
                <article className="admin-card admin-kpi-card">
                    <p className="admin-kpi-label">Pending Actions</p>
                    <p className="admin-kpi-value">1</p>
                </article>
            </section>

            <section className="admin-dashboard-grid">
                <article className="admin-card admin-widget-card">
                    <div className="admin-widget-header">
                        <h3 className="admin-widget-title">System Health</h3>
                        <span className="admin-chip active">Healthy</span>
                    </div>
                    <div className="admin-system-status-list">
                        <div className="admin-system-status-row">
                            <span className="admin-system-status-label">API Uptime</span>
                            <span className="admin-system-status-value good">99.97%</span>
                        </div>
                        <div className="admin-system-status-row">
                            <span className="admin-system-status-label">Queue Lag</span>
                            <span className="admin-system-status-value">12 sec</span>
                        </div>
                        <div className="admin-system-status-row">
                            <span className="admin-system-status-label">Storage Usage</span>
                            <span className="admin-system-status-value warn">45%</span>
                        </div>
                    </div>
                </article>

                {widgetServices.length === 0 ? (
                    <article className="admin-empty-state">
                        <h3 className="admin-widget-title">No service widgets yet</h3>
                        <p>Install and activate services in Marketplace to display operational metrics here.</p>
                    </article>
                ) : (
                    widgetServices.map((service) => {
                        const Widget = service.DashboardWidget;
                        if (!Widget) {
                            return null;
                        }

                        return (
                            <article key={service.id} className="admin-card admin-widget-card">
                                <div className="admin-widget-header">
                                    <div className="admin-widget-title-wrap">
                                        <span className="admin-widget-icon">{service.icon}</span>
                                        <h3 className="admin-widget-title">{service.name}</h3>
                                    </div>
                                    <span className="admin-chip active">Active</span>
                                </div>
                                <Widget />
                            </article>
                        );
                    })
                )}
            </section>
        </div>
    );
};

export default DashboardHome;
