import { PublicKey, SecretKey, Signature, deserializeHexStrToPublicKey, deserializeHexStrToSignature, deserializeHexStrToSecretKey } from './mcl';

export { PublicKey, SecretKey, Signature, deserializeHexStrToPublicKey, deserializeHexStrToSignature, deserializeHexStrToSecretKey };

export function randomSK() {
    const sk = new SecretKey();
    sk.setByCSPRNG();
    return sk;
}

export const multiSigAggregate = (sigs, pubs) => {
    const sig = new Signature();
    sig.multiAggregate(sigs, pubs);
    return sig;
}

export const multiPkAggregate = (pubs) => {
    const pub = new PublicKey();
    pub.multiAggregate(pubs);
    return pub;
}

export const aggregate = (sigs) => {
    const sig = new Signature();
    sig.aggregate(sigs);
    return sig;
}

export const aggregateMsg = (msgs) => {
    return new Uint8Array(msgs.reduce((prev, curr) => [...prev, ...curr], []));
}

export const multiVerify = (sig, pubs, msgs) => {
    return sig.aggregateVerifyNoCheck(pubs, aggregateMsg(msgs));
}
