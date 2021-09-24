import { uint8ArrayToHex } from './codec';

const textEncoder = new TextEncoder();

export const sha256 = async (message) => uint8ArrayToHex(new Uint8Array(
    await crypto.subtle.digest('SHA-256', textEncoder.encode(message))
));
