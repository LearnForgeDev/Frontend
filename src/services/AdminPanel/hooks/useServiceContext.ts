import {createContext, useContext} from 'react';
import type {ServiceContext} from '@/Assets/Types/serviceTypes';

export const ServicesContext = createContext<ServiceContext>({
    selectedServices: [],
    selectService: () => {},
    deselectService: () => {},
});

export const useServiceContext = (): ServiceContext => useContext(ServicesContext);
