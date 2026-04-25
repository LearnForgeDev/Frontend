const BASE_PATH = 'api/ApiAuth/';

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

type RegisterUserResponse = {
    jwtToken: string;
    refreshToken: string;
    userName: string;
    userPublicId: string;
}

type InviteParams = {
    schoolPublicId: string;
    role: '0' | '1' | '2';
    maxUses: number | string;
    expiresInMinutes: number | string;
}

export async function registerStudent(params: RegisterStudentParams): Promise<RegisterUserResponse> {
    const res = await fetch(`${BASE_PATH}/reg`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    })

    const data = await res.json();
    return data as RegisterUserResponse;
}

export async function registerFounder(params: RegisterFounderParams): Promise<RegisterUserResponse> {
    const res = await fetch(`${BASE_PATH}/register-founder`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    })

    const data = await res.json();
    return data as RegisterUserResponse;
}

export async function requestSchool(params: RequestSchoolParams) {
    const res = await fetch(`${BASE_PATH}/request-school`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    })

    const data = await res.json();
    return data;
}

export async function login(params: LoginParams) {
    const res = await fetch(`${BASE_PATH}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
    })

    const data = await res.json();
    return data;
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