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
  configOverwrite: {
    prejoinPageEnabled: boolean;
    startWithAudioMuted: boolean;
    startWithVideoMuted: boolean;
  };
  interfaceConfigOverwrite: {
    SHOW_JITSI_WATERMARK: boolean;
    SHOW_WATERMARK_FOR_GUESTS: boolean;
    SHOW_BRAND_WATERMARK: boolean;
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
