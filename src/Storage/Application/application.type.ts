import type { createApplicationStore } from './application.store';

export type ApplicationStore = ReturnType<typeof createApplicationStore>;
export type ApplicationState = ReturnType<ApplicationStore['getState']>;
export type ApplicationDispatch = ApplicationStore['dispatch'];
