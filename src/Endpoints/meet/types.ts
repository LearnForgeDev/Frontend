export interface CreateJitsiTokenRequest {
  schoolPublicId: string;
  room: string;
}

export interface JitsiTokenResponse {
  roomUrl: string;
}

export interface ScreenShareRequestModel {
  schoolPublicId: string;
  room: string;
}

export interface ModerateScreenShareRequestModel {
  schoolPublicId: string;
  room: string;
  participantUserPublicId: string;
}

export interface EndJitsiRoomRequest {
  schoolPublicId: string;
  room: string;
}

export interface SaveWhiteboardArchivePointerRequest {
  schoolPublicId: string;
  room: string;
  whiteboardUrl?: string;
}

export interface ScreenShareResponse {
  success: boolean;
}

export interface WhiteboardArchiveResponse {
  success: boolean;
}
