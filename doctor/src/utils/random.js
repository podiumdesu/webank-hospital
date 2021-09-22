import { fromUint8Array } from './codec';

export const randomHexString = (length = 32) => {
    return fromUint8Array(crypto.getRandomValues(new Uint8Array(length / 2)), 'hex');
}
