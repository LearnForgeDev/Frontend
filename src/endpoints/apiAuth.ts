import config from '../config.ts';
import type {UserIdentity} from "../types/commonTypes.ts";

const BASE_PATH = `${config.endpointUrl}/api/ApiAuth`;

type LoginParams = {
    name: string;
    password: string;
}

type RegisterFounderParams = LoginParams & {
    confirmPassword: string;
}

type RegisterStudentParams = RegisterFounderParams & {
    inviteToken: string;
}

type RequestSchoolParams = {
    schoolName: string;
}

type RefreshTokenParams = {
    refreshToken: string;
}

type InviteParams = {
    schoolPublicId: string;
    role: '0' | '1' | '2';
    maxUses: number | string;
    expiresInMinutes: number | string;
}

export async function registerStudent(params: RegisterStudentParams): Promise<UserIdentity> {
    const res = await fetch(`${BASE_PATH}/reg`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    })

    const data = await res.json();
    return data as UserIdentity;
}

export async function registerFounder(params: RegisterFounderParams): Promise<UserIdentity> {
    const res = await fetch(`${BASE_PATH}/register-founder`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    })

    if (!res.ok) {
        if (res.status === 409) {
            throw new Error('Пользователь с таким именем уже существует');
        }
    }

    const data = await res.json();
    return data as UserIdentity;
}

export async function requestSchool(params: RequestSchoolParams) {
    const res = await fetch(`${BASE_PATH}/request-school`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    })

    if (!res.ok) {
        if (res.status === 401) {
            return {
                status: 'pending',
                message: 'Заявка на создание школы уже отправлена и ожидает рассмотрения',
            };
        }
    }

    const data = await res.json();
    return data;
}

export async function login(params: LoginParams): Promise<UserIdentity> {
    const res = await fetch(`${BASE_PATH}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    })

    const data = await res.json();
    return data as UserIdentity;
}

export async function refreshToken(params: RefreshTokenParams) {
    const res = await fetch(`${BASE_PATH}/refresh-token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    })

    const data = await res.json();
    return data;
}

export async function invite(params: InviteParams) {
    const res = await fetch(`${BASE_PATH}/invite`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    })

    const data = await res.json();
    return data;
}