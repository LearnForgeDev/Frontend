import { JITSI_SCRIPT_ID } from '../CallsPage.constants';
import { JITSI_SCRIPT_ERROR, JITSI_SCRIPT_TIMEOUT_MS } from './loadJitsiScript.const';

const pendingLoads = new Map<string, Promise<void>>();

export function loadJitsiScript(domain: string): Promise<void> {
  if (window.JitsiMeetExternalAPI) return Promise.resolve();
  const pending = pendingLoads.get(domain);
  if (pending) return pending;

  const promise = new Promise<void>((resolve, reject) => {
    document.getElementById(JITSI_SCRIPT_ID)?.remove();
    const script = document.createElement('script');
    script.id = JITSI_SCRIPT_ID;
    script.src = `https://${domain}/external_api.js`;
    script.async = true;
    const cleanup = () => {
      clearTimeout(timeout);
      script.onload = null;
      script.onerror = null;
    };
    const fail = () => {
      cleanup();
      script.remove();
      reject(new Error(JITSI_SCRIPT_ERROR));
    };
    const timeout = setTimeout(fail, JITSI_SCRIPT_TIMEOUT_MS);
    script.onload = () => {
      if (!window.JitsiMeetExternalAPI) {
        fail();
        return;
      }
      cleanup();
      resolve();
    };
    script.onerror = fail;
    document.body.appendChild(script);
  }).finally(() => pendingLoads.delete(domain));

  pendingLoads.set(domain, promise);
  return promise;
}
