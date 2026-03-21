import React from 'react';

export interface ServiceManifest {
    id: string;
    name: string;
    description: string;
    adminRoute: string;
    icon?: React.ReactNode | string;
    version?: string;
    // Widget for the main Dashboard
    DashboardWidget?: React.FC;
    isEnabled: boolean,
    isBought: boolean,
    price: number,
    features: string[],
}

export interface ServiceConfig {
    id: string;
    isEnabled: boolean,
    lastUpdated?: string;
}


export type ServiceContext = {
    selectedServices: ServiceManifest[];
    selectService: (service: ServiceManifest) => void;
    deselectService: (service: ServiceManifest) => void;
}