export interface MeetTokenRequestDto {
  schoolPublicId: string;
  roomName: string;
}

export interface JitsiTokenResponse {
  roomUrl: string;
}

export interface ScreenShareRequestDto {
  schoolPublicId: string;
  roomName: string;
}

export interface ScreenShareApproveDto {
  schoolPublicId: string;
  roomName: string;
  userPublicId: string;
}

export interface WhiteboardArchiveDto {
  schoolPublicId: string;
  roomName: string;
  whiteboardUrl: string;
}

export interface ScreenShareResponse {
  success: boolean;
}

export interface WhiteboardArchiveResponse {
  success: boolean;
}
