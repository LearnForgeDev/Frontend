export interface JitsiApi {
  dispose: () => void;
  executeCommand: (command: string) => void;
  addEventListener: {
    (event: 'customToolbarButtonClicked', listener: (event: JitsiToolbarButtonClickEvent) => void): void;
    (event: string, listener: (...args: unknown[]) => void): void;
  };
  registerCustomToolbarButton?: (button: JitsiToolbarButton) => void;
}

export interface JitsiMeetExternalAPIConstructor {
  new (domain: string, options: JitsiMeetExternalAPIOptions): JitsiApi;
}

export interface JitsiMeetExternalAPIOptions {
  roomName: string;
  jwt?: string;
  parentNode: HTMLElement;
  width: string;
  height: string;
  lang?: string;
  configOverwrite: {
    prejoinPageEnabled: boolean;
    startWithAudioMuted: boolean;
    startWithVideoMuted: boolean;
    defaultLanguage: string;
    hideConferenceSubject: boolean;
    subject: string;
  };
  interfaceConfigOverwrite: {
    SHOW_JITSI_WATERMARK: boolean;
    SHOW_WATERMARK_FOR_GUESTS: boolean;
    SHOW_BRAND_WATERMARK: boolean;
    SHOW_POWERED_BY: boolean;
    SHOW_ROOM_NAME: boolean;
    DEFAULT_LOGO_URL: string;
    DEFAULT_WELCOME_PAGE_LOGO_URL: string;
  };
}

export interface JitsiToolbarButton {
  id: string;
  text: string;
  icon: string;
  btnId: string;
}

export interface JitsiToolbarButtonClickEvent {
  id: string;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI?: JitsiMeetExternalAPIConstructor;
  }
}
