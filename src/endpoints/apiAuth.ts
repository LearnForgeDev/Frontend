import config from "../config.ts";
import type { UserIdentity } from "../types/commonTypes.ts";

const BASE_PATH = `${config.endpointUrl}/api/ApiAuth`;

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

export async function registerStudent(
  params: RegisterStudentParams,
): Promise<UserIdentity> {
  console.log(`[API Request] POST ${BASE_PATH}/reg`, params);
  const res = await fetch(`${BASE_PATH}/reg`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  console.log(`[API Response] ${res.status} ${res.statusText}`);
  if (!res.ok) {
    const err = await res.text();
    console.error(`[API Error] ${err}`);
    throw new Error(`Ошибка регистрации: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  console.log(`[API Data]`, data);
  return data as UserIdentity;
}

export async function registerFounder(
  params: RegisterFounderParams,
): Promise<UserIdentity> {
  console.log(`[API Request] POST ${BASE_PATH}/register-founder`, params);
  const res = await fetch(`${BASE_PATH}/register-founder`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  console.log(`[API Response] ${res.status} ${res.statusText}`);
  if (!res.ok) {
    if (res.status === 409) {
      console.error(`[API Error] User already exists`);
      throw new Error("Пользователь с таким именем уже существует");
    }
    const err = await res.text();
    console.error(`[API Error] ${err}`);
    throw new Error(`Ошибка регистрации: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  console.log(`[API Data]`, data);
  return data as UserIdentity;
}

export async function requestSchool(
  params: RequestSchoolParams,
  jwtToken: string,
): Promise<SchoolRequestStatusDto> {
  console.log(`[API Request] POST ${BASE_PATH}/request-school`, params);
  const res = await fetch(`${BASE_PATH}/request-school`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify(params),
  });

  console.log(`[API Response] ${res.status} ${res.statusText}`);
  if (!res.ok) {
    let errorMessage = `Ошибка сервера: ${res.status}`;
    try {
      const errorData = await res.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      const errorText = await res.text().catch(() => "");
      if (errorText) errorMessage = errorText;
    }
    console.error(`[API Error] ${errorMessage}`);
    throw new Error(errorMessage);
  }

  const text = await res.text();
  console.log(`[API Raw Response]`, text);
  if (!text) {
    return { requestPublicId: "", status: "Accepted" };
  }

  try {
    const data = JSON.parse(text);
    console.log(`[API Data]`, data);
    return data;
  } catch {
    return { requestPublicId: "", status: "Accepted" };
  }
}

export async function getSchoolRequestStatus(
  publicId: string,
  jwtToken: string,
): Promise<SchoolRequestStatusDto> {
  console.log(
    `[API Request] GET ${BASE_PATH}/request-school/${publicId}/status`,
  );
  const res = await fetch(`${BASE_PATH}/request-school/${publicId}/status`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
  });

  console.log(`[API Response] ${res.status} ${res.statusText}`);
  if (!res.ok) {
    console.error(`[API Error] Status: ${res.status}`);
    throw new Error(`Ошибка при проверке статуса: ${res.status}`);
  }

  const data = await res.json();
  console.log(`[API Data]`, data);
  return data;
}

export async function getAllSchoolRequests(
  jwtToken: string,
): Promise<SchoolRequestStatusDto[]> {
  console.log(`[API Request] GET ${BASE_PATH}/request-school/all`);
  const res = await fetch(`${BASE_PATH}/request-school/all`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
  });

  console.log(`[API Response] ${res.status} ${res.statusText}`);
  if (!res.ok) {
    console.error(`[API Error] Status: ${res.status}`);
    throw new Error(`Ошибка при получении списка заявок: ${res.status}`);
  }

  const data = await res.json();
  console.log(`[API Data]`, data);
  return data;
}

export async function login(params: LoginParams): Promise<UserIdentity> {
  console.log(`[API Request] POST ${BASE_PATH}/login`, {
    ...params,
    password: "***",
  });
  const res = await fetch(`${BASE_PATH}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  console.log(`[API Response] ${res.status} ${res.statusText}`);
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`[API Error] ${errorText}`);
    throw new Error(errorText || `Ошибка входа: ${res.status}`);
  }

  const data = await res.json();
  console.log(`[API Data]`, data);
  return data as UserIdentity;
}

export async function joinSchool(
  params: JoinSchoolByInviteParams,
  jwtToken: string,
): Promise<UserIdentity> {
  console.log(`[API Request] POST ${BASE_PATH}/join-school`, params);
  const res = await fetch(`${BASE_PATH}/join-school`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify(params),
  });

  console.log(`[API Response] ${res.status} ${res.statusText}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    const msg =
      errorData.message || `Ошибка при вступлении в школу: ${res.status}`;
    console.error(`[API Error] ${msg}`);
    throw new Error(msg);
  }

  const data = await res.json();
  console.log(`[API Data]`, data);
  return data as UserIdentity;
}

export async function refreshToken(params: RefreshTokenParams) {
  console.log(`[API Request] POST ${BASE_PATH}/refreshToken`, params);
  const res = await fetch(`${BASE_PATH}/refreshToken`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(params),
  });

  console.log(`[API Response] ${res.status} ${res.statusText}`);
  if (!res.ok) {
    console.error(`[API Error] Refresh failed`);
    throw new Error("Не удалось обновить токен");
  }

  const data = await res.json();
  console.log(`[API Data]`, data);
  return data;
}

export async function invite(params: InviteParams, jwtToken: string) {
  console.log(`[API Request] POST ${BASE_PATH}/invite`, params);
  const res = await fetch(`${BASE_PATH}/invite`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwtToken}`,
    },
    body: JSON.stringify(params),
  });

  console.log(`[API Response] ${res.status} ${res.statusText}`);
  if (!res.ok) {
    console.error(`[API Error] Invite creation failed: ${res.status}`);
    throw new Error(`Ошибка при создании инвайта: ${res.status}`);
  }

  const data = await res.json();
  console.log(`[API Data]`, data);
  return data;
}
