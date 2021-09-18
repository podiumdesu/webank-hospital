import mcl from 'mcl-wasm/browser';

await mcl.init(mcl.BLS12_381);

const {
    deserializeHexStrToG1,
    deserializeHexStrToG2,
    deserializeHexStrToFr,
    deserializeHexStrToGT,
    hashAndMapToG1,
    hashAndMapToG2,
    mul,
    add,
    sub,
    pow,
    inv,
    pairing,
    hashToFr,
    Fr,
} = mcl;

export function generatorGen(g, h, fromHex = false) {
    return {
        g: fromHex ? deserializeHexStrToG1(g) : hashAndMapToG1(g),
        h: fromHex ? deserializeHexStrToG2(h) : hashAndMapToG2(h),
    };
}

export function keyGen(g, sk = randomInFr()) {
    return { sk, pk: mul(g, sk) };
}

export function encrypt(plain, pk, g, h) {
    const r = randomInFr();
    return {
        ca0: add(deserializeHexStrToFr(plain), hashToFr(pow(pairing(g, h), r).serialize())),
        ca1: mul(pk, r)
    };
}

export function decrypt({ ca0, ca1 }, sk, h) {
    return serialize(sub(ca0, hashToFr(pow(pairing(ca1, h), inv(sk)).serialize())));
}

export function reKeyGen(ska, pkb) {
    return mul(pkb, inv(ska));
}

export function reEncrypt({ ca0, ca1 }, reKey) {
    return { cb0: ca0, cb1: pairing(ca1, reKey) };
}

export function reDecrypt({ cb0, cb1 }, sk) {
    return serialize(sub(cb0, hashToFr(pow(cb1, inv(sk)).serialize())));
}

export function randomGen() {
    return serialize(randomInFr());
}

export function randomInFr() {
    const p = new Fr();
    p.setByCSPRNG();
    return p;
}

export function serialize(obj) {
    return obj.serializeToHexStr();
}

export function deserialize(str, group) {
    switch (group) {
        case 'Fr':
            return deserializeHexStrToFr(str);
        case 'G1':
            return deserializeHexStrToG1(str);
        case 'G2':
            return deserializeHexStrToG2(str);
        case 'GT':
            return deserializeHexStrToGT(str);
    }
}
