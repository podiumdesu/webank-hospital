export const sha256 = async (message) => new Uint8Array(
    await crypto.subtle.digest('SHA-256', message)
);
