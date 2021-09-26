import { fromUint8Array, toUint8Array } from './codec';

export const hmac = async (
    data,
    key,
    inputEncoding = 'utf-8',
    outputEncoding = 'hex'
) => {
    const result = await crypto.subtle.sign('HMAC', key, toUint8Array(data, inputEncoding));
    return fromUint8Array(new Uint8Array(result), outputEncoding);
};
