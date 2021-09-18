import { fromUint8Array } from './codec';

export const deriveKeyFromPassword = async (password, salt) => {
    const key = await crypto.subtle.importKey(
        'raw',
        new TextEncoder().encode(password),
        'PBKDF2',
        false,
        ['deriveBits', 'deriveKey']
    );
    const algorithm ={
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
    };
    return {
        hmac: await crypto.subtle.deriveKey(
            algorithm,
            key,
            {
                name: 'HMAC',
                hash: {
                    name: 'SHA-256',
                },
            },
            true,
            ['sign', 'verify']
        ),
        raw: fromUint8Array(new Uint8Array(await crypto.subtle.exportKey(
            'raw',
            await crypto.subtle.deriveKey(
                algorithm,
                key,
                {
                    name: 'AES-GCM',
                    length: 256,
                },
                true,
                ['encrypt']
            )
        )), 'hex'),
    };
};
