export interface MeetTokenRequestDto {
  schoolPublicId: string;
  Room: string;
}

export interface JitsiTokenResponse {
  roomUrl: string;
}

export interface ScreenShareRequestDto {
  schoolPublicId: string;
  Room: string;
}

export interface ScreenShareApproveDto {
  schoolPublicId: string;
  Room: string;
  userPublicId: string;
}

export interface WhiteboardArchiveDto {
  schoolPublicId: string;
  Room: string;
  whiteboardUrl: string;
}

export interface ScreenShareResponse {
  success: boolean;
}

export interface WhiteboardArchiveResponse {
  success: boolean;
}
