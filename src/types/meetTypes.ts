export type MeetPermissions = {
  moderator: boolean;
  screenSharing?: boolean;

  canCreateRoom?: boolean;
  canManageRoom?: boolean;
  canMuteParticipants?: boolean;
  canDisableParticipantVideo?: boolean;
  canKickParticipants?: boolean;
  canApproveScreenSharing?: boolean;
  canShareScreen?: boolean;
  canRequestScreenShare?: boolean;
};

export type MeetTokenRequest = {
  room: string;
  schoolPublicId: string;
};

export type MeetTokenResponse = {
  room: string;
  roomUrl: string;
  token: string;
  expiresAt: string;
  permissions: MeetPermissions;
};