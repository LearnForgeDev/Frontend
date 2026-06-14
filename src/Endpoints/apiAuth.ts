/* eslint-disable no-empty */
import axios from 'axios';
import config from '../config.ts';
import type { UserIdentity } from '@/Assets/Types/commonTypes';
import { USER_STORAGE_KEY } from '@/Storage/Context/UserContext';
import { createApiClient } from '@/Endpoints/factory';

const BASE_PATH = `${config.endpointUrl}/api/ApiAuth`;
const client = createApiClient(BASE_PATH);

type LoginParams = {
  name: string;
  password: string;
};

type RegisterFounderParams = LoginParams & {
  confirmPassword: string;
};

type RegisterStudentParams = RegisterFounderParams & {
  inviteToken: string;
};

type RequestSchoolParams = {
  schoolName: string;
};

type RefreshTokenParams = {
  refreshToken: string;
};

type InviteParams = {
  schoolPublicId: string;
  role: "0" | "1" | "2";
  maxUses: number | string;
  expiresInMinutes: number | string;
};

type JoinSchoolByInviteParams = {
  inviteToken: string;
};

export type SchoolRequestStatusDto = {
  requestPublicId: string;
  status: string;
  schoolName?: string;
  requestedAt?: string;
};

function getErrorMessage(err: unknown, defaultMsg: string): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message?: unknown }).message || defaultMsg);
  }
  return defaultMsg;
}

function getErrorStatus(err: unknown): number | undefined {
  if (err && typeof err === 'object' && 'status' in err) {
    const status = (err as { status?: unknown }).status;
    return typeof status === 'number' ? status : undefined;
  }
  return undefined;
}

export async function registerStudent(
  params: RegisterStudentParams,
): Promise<UserIdentity> {
  try {
    const res = await client.post<UserIdentity>('/reg', params);
    const data = res.data;
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
    } catch {}
    return data;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, 'Ошибка регистрации'));
  }
}

export async function registerFounder(
  params: RegisterFounderParams,
): Promise<UserIdentity> {
  try {
    const res = await client.post<UserIdentity>('/reg', params);
    const data = res.data;
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
    } catch {}
    return data;
  } catch (err: unknown) {
    if (getErrorStatus(err) === 409) {
      throw new Error("Пользователь с таким именем уже существует");
    }
    throw new Error(getErrorMessage(err, 'Ошибка регистрации'));
  }
}

export async function requestSchool(
  params: RequestSchoolParams,
  jwtToken: string,
): Promise<SchoolRequestStatusDto> {
  if (!jwtToken) {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) jwtToken = JSON.parse(stored).jwtToken || jwtToken;
    } catch {}
  }

  try {
    const res = await client.post<SchoolRequestStatusDto>('/request-school', params, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    if (!res.data) {
      return { requestPublicId: "", status: "Accepted" };
    }
    return res.data;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, 'Ошибка сервера'));
  }
}

export async function getSchoolRequestStatus(
  publicId: string,
  jwtToken: string,
): Promise<SchoolRequestStatusDto> {
  if (!jwtToken) {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) jwtToken = JSON.parse(stored).jwtToken || jwtToken;
    } catch {}
  }

  try {
    const res = await client.get<SchoolRequestStatusDto>(`/request-school/${publicId}/status`, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    return res.data;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, 'Ошибка при проверке статуса'));
  }
}

export async function getAllSchoolRequests(
  jwtToken: string,
): Promise<SchoolRequestStatusDto[]> {
  if (!jwtToken) {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) jwtToken = JSON.parse(stored).jwtToken || jwtToken;
    } catch {}
  }

  try {
    const res = await client.get<SchoolRequestStatusDto[]>('/request-school/all', {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    return res.data;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, 'Ошибка при получении списка заявок'));
  }
}

export async function login(params: LoginParams): Promise<UserIdentity> {
  try {
    const res = await axios.post<UserIdentity>(`${BASE_PATH}/login`, params);
    const data = res.data;
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
    } catch {}
    return data;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, 'Ошибка входа'));
  }
}

export async function joinSchool(
  params: JoinSchoolByInviteParams,
  jwtToken: string,
): Promise<UserIdentity> {
  if (!jwtToken) {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) jwtToken = JSON.parse(stored).jwtToken || jwtToken;
    } catch {}
  }

  try {
    const res = await client.post<UserIdentity>('/join-school', params, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    const data = res.data;
    try {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data));
    } catch {}
    return data;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, 'Ошибка при вступлении в школу'));
  }
}

export async function refreshToken(params: RefreshTokenParams) {
  try {
    const res = await axios.post(`${BASE_PATH}/refreshToken`, params, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = res.data;
    try {
      const storedRaw = localStorage.getItem(USER_STORAGE_KEY);
      if (storedRaw) {
        const stored = JSON.parse(storedRaw) as UserIdentity;
        const updated = { ...stored, ...(data as Partial<UserIdentity>) } as UserIdentity;
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updated));
      }
    } catch {}
    return data;
  } catch (err: unknown) {
    let message = 'Не удалось обновить токен';
    if (axios.isAxiosError(err)) {
      message = err.response?.data?.message || err.message;
    } else if (err instanceof Error) {
      message = err.message;
    }
    throw new Error(message);
  }
}

export async function invite(params: InviteParams, jwtToken: string) {
  if (!jwtToken) {
    try {
      const stored = localStorage.getItem(USER_STORAGE_KEY);
      if (stored) jwtToken = JSON.parse(stored).jwtToken || jwtToken;
    } catch {}
  }

  try {
    const res = await client.post('/invite', params, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    return res.data;
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, 'Ошибка при создании инвайта'));
  }
}
