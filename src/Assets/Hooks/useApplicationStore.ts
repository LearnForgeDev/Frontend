import { useDispatch, useSelector, useStore } from 'react-redux';
import type { ApplicationDispatch, ApplicationState, ApplicationStore } from '@/Storage/Application/application.type';

export const useApplicationDispatch = useDispatch.withTypes<ApplicationDispatch>();
export const useApplicationSelector = useSelector.withTypes<ApplicationState>();
export const useApplicationStore = useStore.withTypes<ApplicationStore>();
