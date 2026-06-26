export function parseJwt (token: string): {
    "userId": string,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": string,
    "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name": string,
    "exp": string,
    "iss": string,
    "aud": string,
} {
    const base64Url = token.split('.')[1];
    const base64 = base64Url
        .replace(/-/g, '+')
        .replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
        window.atob(base64)
            .split('')
            .map(
                (c) => {
                    return '%' + ('00' + c.charCodeAt(0)
                        .toString(16))
                        .slice(-2);
                }
            )
            .join('')
    );

    return JSON.parse(jsonPayload);
}
