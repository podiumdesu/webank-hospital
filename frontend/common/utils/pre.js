import mcl from 'mcl-wasm/browser';

await mcl.init(mcl.BLS12_381);

export const {
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
    G1,
    G2,
    GT,
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

export function keyDer(key, rand) {
    return mul(key, hashToFr(rand));
}

export function idGen(pka, pkb, rand) {
    return pow(pairing(pka, pkb), hashToFr(rand));
}

export function encrypt(plain, pk, g, h) {
    const r = randomInFr();
    return [
        add(deserializeHexStrToFr(plain), hashToFr(pow(pairing(g, h), r).serialize())),
        mul(pk, r)
    ];
}

export function decrypt([ca0, ca1], sk, h) {
    return serialize(sub(ca0, hashToFr(pow(pairing(ca1, h), inv(sk)).serialize())));
}

export function reKeyGen(ska, pkb) {
    return mul(pkb, inv(ska));
}

export function reEncrypt([ca0, ca1], reKey) {
    return [ca0, pairing(ca1, reKey)];
}

export function reDecrypt([cb0, cb1], sk) {
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

export function deserialize(bytes, Class) {
    const obj = new Class();
    obj.deserialize(bytes);
    return obj;
}