import { bufferToInt, toBuffer, ToBufferInputTypes } from 'ethereumjs-util';
import { Keccak } from 'sha3';
import { encode } from 'rlp';
import { ecdsaRecover, ecdsaSign } from 'secp256k1';

/**
 * Constructor of transaction
 * @param {data} data transaction data
 */
export class Transaction {
    raw: Buffer[] = [];
    sig: Buffer[] = [
        Buffer.from([0x1c]), // v
        Buffer.from([]), // r
        Buffer.from([]) // s
    ];

    constructor(data: Record<string, ToBufferInputTypes>) {
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
        ].map((name) => name in data ? toBuffer(data[name]) : Buffer.from([]))
    }

    serialize() {
        return encode([...this.raw, ...this.sig]);
    }

    hash() {
        // create hash
        return new Keccak(256).update(encode(this.raw)).digest()
    }

    verify() {
        const msgHash = this.hash();
        try {
            ecdsaRecover(Buffer.concat(this.sig.slice(1)), bufferToInt(this.sig[0]) - 27, msgHash);
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
