import config from '../config.ts';
import type { MeetTokenRequest, MeetTokenResponse } from '../types/meetTypes.ts';

const BASE_PATH = `${config.endpointUrl}/api/ApiMeet`;

export async function getMeetToken(
  jwtToken: string,
  payload: MeetTokenRequest,
): Promise<MeetTokenResponse> {
  const res = await fetch(`${BASE_PATH}/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Meet token failed: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data as MeetTokenResponse;
}