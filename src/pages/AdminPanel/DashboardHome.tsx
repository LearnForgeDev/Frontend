import React, {type JSX} from 'react';
import { serviceRegistry } from '../../services/ServiceRegistry';
import './dashboard.css';
import type {ServiceManifest} from "../../types/serviceTypes.ts";

const DashboardHome: React.FC = () => {
    const services = serviceRegistry.getAll();
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

            <section className="admin-dashboard-grid">
                {widgetServices.length === 0 ? (
                    <WidgetsPlaceholder />
                ) : (
                    widgetServices.map((service) => <ServiceWidget service={service} />)
                )}
            </section>
        </div>
    );
};

export default DashboardHome;

const WidgetsPlaceholder = ():JSX.Element => {
    return (
        <div className="admin-empty-state">
            <h3 className="admin-widget-title">No service widgets yet</h3>
            <p>Install and activate services in Marketplace to display operational metrics here.</p>
        </div>
    );
}

const ServiceWidget =
    ({service}: {service: ServiceManifest}): JSX.Element | null => {
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
}