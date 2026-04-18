import {createContext, useContext} from "react";
import type {ServiceContext} from "../../../types/serviceTypes.ts";

export const ServicesContext = createContext<ServiceContext>({
    selectedServices: [],
    selectService: () => {},
    deselectService: () => {},
});

export const useServiceContext = (): ServiceContext => useContext(ServicesContext);
