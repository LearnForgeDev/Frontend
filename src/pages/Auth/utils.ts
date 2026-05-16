export function sanitizeInviteToken(token: string){
    return token
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .slice(0, 6);
}