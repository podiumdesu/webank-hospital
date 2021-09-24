import { fromUint8Array, hexToUint8Array, toUint8Array } from './codec';

export class AES {
    #key;
    #iv;
    #algorithm;

    constructor(key, iv, algorithm = 'AES-GCM') {
        this.#key = key;
        this.#iv = iv ?? crypto.getRandomValues(new Uint8Array(algorithm === 'AES-GCM' ? 12 : 16));
        this.#algorithm = algorithm;
    }

    static convertKey(key, algorithm = 'AES-GCM') {
        return crypto.subtle.importKey(
            'raw',
            hexToUint8Array(key),
            {
                name: algorithm,
                length: 256,
            },
            false,
            ['encrypt', 'decrypt'],
        );
    }

    static convertIV(iv) {
        return hexToUint8Array(iv);
    }

    get iv() {
        return this.#iv;
    }

    async encrypt(
        plaintext,
        plaintextEncoding = 'utf-8',
        ciphertextEncoding = 'base64'
    ) {
        return fromUint8Array(new Uint8Array(await crypto.subtle.encrypt(
            {
                name: this.#algorithm,
                iv: this.#algorithm === 'AES-CTR' ? undefined : this.#iv,
                counter: this.#algorithm === 'AES-CTR' ? this.#iv : undefined,
                length: this.#algorithm === 'AES-CTR' ? 64 : undefined,
            },
            this.#key,
            toUint8Array(plaintext, plaintextEncoding),
        )), ciphertextEncoding);
    }

    async decrypt(
        ciphertext,
        ciphertextEncoding = 'base64',
        plaintextEncoding = 'utf-8',
    ) {
        return fromUint8Array(new Uint8Array(await crypto.subtle.decrypt(
            {
                name: this.#algorithm,
                iv: this.#algorithm === 'AES-CTR' ? undefined : this.#iv,
                counter: this.#algorithm === 'AES-CTR' ? this.#iv : undefined,
                length: this.#algorithm === 'AES-CTR' ? 64 : undefined,
            },
            this.#key,
            toUint8Array(ciphertext, ciphertextEncoding),
        )), plaintextEncoding);
    }
}
