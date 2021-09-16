import { Keccak } from 'sha3';
import { encode } from '@ethersproject/rlp';
import { ecdsaRecover, ecdsaSign } from 'secp256k1';

const padToEven = (str: string) => str.length % 2 ? `0${str}` : str;

export class Transaction {
    raw: Buffer[] = [];
    sig: Buffer[] = [
        Buffer.from([0x1c]), // v
        Buffer.from([]), // r
        Buffer.from([]) // s
    ];

    constructor(data: Record<string, string | number | Buffer>) {
        this.raw = [
            'randomid',
            'gasPrice',
            'gas',
            'blockLimit',
            'to',
            'value',
            'data',
            'chainId',
            'groupId',
            'extraData'
        ].map((key) => {
            const value = data[key];
            if (Buffer.isBuffer(value)) {
                return value;
            }
            switch (typeof value) {
                case 'number':
                    return Buffer.from(padToEven(value.toString(16)), 'hex');
                case 'string':
                    return Buffer.from(padToEven(value.slice(2)), 'hex');
                default:
                    return Buffer.from([]);
            }
        })
    }

    serialize() {
        return encode([...this.raw, ...this.sig]);
    }

    hash() {
        return new Keccak(256).update(encode(this.raw)).digest()
    }

    verify() {
        const msgHash = this.hash();
        try {
            ecdsaRecover(Buffer.concat(this.sig.slice(1)), this.sig[0][0] - 27, msgHash);
            return true;
        } catch {
            return false;
        }
    }

    sign(privateKey: Buffer) {
        const { signature, recid } = ecdsaSign(this.hash(), privateKey);
        this.sig = [
            Buffer.from([recid + 27]),
            Buffer.from(signature.slice(0, 32)),
            Buffer.from(signature.slice(32, 64)),
        ]
    }
}
