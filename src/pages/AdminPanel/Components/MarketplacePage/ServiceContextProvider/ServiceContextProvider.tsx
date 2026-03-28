import {type ReactNode, useState} from "react";
import type {ServiceManifest} from "../../../../../types/serviceTypes.ts";
import {ServicesContext} from "../../../hooks/useServiceContext.ts";

/**
 * Provides context of services selected by the user
 * */
export const ServiceContextProvider =
    ({ children }: {children: ReactNode}) => {
    const [selectedServices, setSelectedServices] = useState<ServiceManifest[]>([]);

    const selectService = (service: ServiceManifest): void => {
        setSelectedServices((prev) => {
            if (prev.some((existingService) => existingService.id === service.id)) {
                return prev;
            }

            return [...prev, service];
        });
    }

    const deselectService = (serviceToDeselect: ServiceManifest): void => {
        setSelectedServices((prev) => prev.filter((service) => service.id !== serviceToDeselect.id));
    }

    return (
        <ServicesContext.Provider value={{ selectedServices, selectService, deselectService }}>
            {children}
        </ServicesContext.Provider>
    );
};
