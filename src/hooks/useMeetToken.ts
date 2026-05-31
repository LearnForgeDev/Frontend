import { useAsync } from 'react-use';

import { getMeetToken } from '../endpoints/Meet.ts';
import type { MeetTokenResponse } from '../types/meetTypes.ts';

type UseMeetTokenResult = {
  meet: MeetTokenResponse | null;
  isLoading: boolean;
  error: string | null;
};

export function useMeetToken(
  jwtToken: string | undefined,
  room: string,
  schoolPublicId: string,
): UseMeetTokenResult {
  const { value, loading, error } = useAsync(async () => {
    if (!jwtToken) {
      throw new Error('Нужно войти в аккаунт');
    }

    if (!schoolPublicId) {
      throw new Error('Не указан schoolPublicId');
    }

    return getMeetToken(jwtToken, { room, schoolPublicId });
  }, [jwtToken, room, schoolPublicId]);

  return {
    meet: value ?? null,
    isLoading: loading,
    error: error ? (error instanceof Error ? error.message : 'Не удалось получить токен встречи') : null,
  };
}

