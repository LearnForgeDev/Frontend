export enum DebugSeverity {
    NEUTRAL = 0,
    WARNING = 1,
    DANGER = 2
}

export const createDebugger = (context: string) => {
    return {
        logEventForDebug: (severity: DebugSeverity, message: string, ...args: unknown[]) => {
            const isDev = import.meta.env.DEV;
            const isDebugParam = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === 'true';

            if (!isDev && !isDebugParam) return;

            let color = 'color: gray';
            let consoleMethod = console.log;

            switch (severity) {
                case DebugSeverity.WARNING:
                    color = 'color: orange';
                    consoleMethod = console.warn;
                    break;
                case DebugSeverity.DANGER:
                    color = 'color: red';
                    consoleMethod = console.error;
                    break;
                case DebugSeverity.NEUTRAL:
                default:
                    color = 'color: #007bff';
                    consoleMethod = console.log;
                    break;
            }

            if (args.length > 0) {
                consoleMethod(`%c[${context}]`, color, message, ...args);
            } else {
                consoleMethod(`%c[${context}]`, color, message);
            }
        }
    };
};
