import React from 'react';

export type ServiceStatus = 'active' | 'inactive' | 'error' | 'beta' | 'configuring';

export interface ServiceManifest {
    id: string;          // unique ID ('lessons', 'whiteboard')
    name: string;        // display name ('Lesson Editor')
    description: string;
    icon?: React.ReactNode; // Icon component or element
    version: string;

    // Routing inside Admin Panel
    adminRoute: string;  // e.g., 'lessons' (relative to /admin/services/)

    // React Component for configuring the service
    ConfigComponent?: React.FC;

    // Widget for the main Dashboard
    DashboardWidget?: React.FC;
}

export interface ServiceConfig {
    id: string;
    status: ServiceStatus;
    config: Record<string, any>;
    lastUpdated?: string;
}

