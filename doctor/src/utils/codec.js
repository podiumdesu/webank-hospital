export const hexToUint8Array = (str) => {
    return new Uint8Array(str.match(/.{1,2}/g)?.map((byte) => parseInt(byte, 16)) ?? []);
};

export const uint8ArrayToHex = (arr) => {
    return arr.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
};

export const base64ToUint8Array = (str) => {
    return Uint8Array.from([...window.atob(str)].map((i) => i.charCodeAt(0)));
};

export const uint8ArrayToBase64 = (arr) => {
    return window.btoa(String.fromCharCode(...arr));
};

export const toUint8Array = (str, encoding) => {
    switch (encoding) {
        case 'utf-8':
            return  new TextEncoder().encode(str);
        case 'hex':
            return hexToUint8Array(str);
        case 'base64':
            return base64ToUint8Array(str);
    }
};

export const fromUint8Array = (arr, encoding) => {
    switch (encoding) {
        case 'base64':
            return uint8ArrayToBase64(arr);
        case 'hex':
            return uint8ArrayToHex(arr);
        case 'utf-8':
            return new TextDecoder().decode(arr);
    }
};
