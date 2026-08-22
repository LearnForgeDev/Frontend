import { MOBILE_USER_AGENT_PATTERN } from './device.const';

export const getIsMobileDevice = (): RegExpMatchArray | null => (
  navigator.userAgent.match(MOBILE_USER_AGENT_PATTERN)
);
