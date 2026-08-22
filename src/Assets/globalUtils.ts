// This file is only for the utilities, that are reused accross different services

/**
 * Shorten string to given length
 * @param str - string to shorten
 * @param length - length to shorten to
 * 
 * @example
 * shortenString("Hello, world!", 5) // "Hello..."
 * shortenString("Hello", 10) // "Hello"
 */
export const shortenString = (str: string, length: number): string => {
    if (str.length > length) {
        return str.slice(0, length) + "...";
    }
    return str;
};

export const formatRoles = (roles: string[]) => {
    const roleMap: Record<string, string> = {
        Teacher: "Преподаватель",
        Student: "Студент",
        Owner: "Владелец",
    };
    return roles.map((r) => roleMap[r] || r).join(", ");
};

/**
 * Creates a pseudo-random UUID. 
 * If length is 36 and crypto is available, uses crypto.randomUUID().
 * Otherwise, generates a random alphanumeric string of the specified length.
 * 
 * @param length - The length of the generated UUID (default is 36)
 */
export const createUUID = (length: number = 36): string => {
    if (length === 36 && typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }

    let result = '';
    while (result.length < length) {
        result += Math.random().toString(36).substring(2);
    }
    return result.substring(0, length);
};

/**
 * Gets value of query param and deletes the param from the url
 * @param param - Name of the query parameter to extract
 * @returns Value of the query parameter or null if not found
 */
export const extractQueryParam = (param: string): string | null => {
    if (typeof window === 'undefined') return null;

    const urlParams = new URLSearchParams(window.location.search);
    const value = urlParams.get(param);

    if (value !== null) {
        urlParams.delete(param);
        const newSearch = urlParams.toString();
        const newUrl =
            window.location.pathname +
            (newSearch ? `?${newSearch}` : '') +
            window.location.hash;
        window.history.replaceState(null, '', newUrl);
    }

    return value;
};
