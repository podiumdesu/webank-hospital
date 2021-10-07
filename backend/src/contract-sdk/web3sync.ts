import { randomBytes } from 'crypto';
import { Configuration } from './config';
import { Transaction } from './transactionObject';

export function getSignTx(
    { groupID, address, privateKey, chainID }: Configuration,
    to: string,
    txData: string,
    blockLimit: number
) {
    const tx = new Transaction({
        data: txData,
        from: address,
        to,
        gas: 1000000,
        randomid: randomBytes(16),
        blockLimit,
        chainId: chainID,
        groupId: groupID,
        extraData: '0x0'
    });
    tx.sign(privateKey);
    return tx.serialize();
}

export function getSignDeployTx(
    { groupID, address, privateKey, chainID }: Configuration,
    bin: string,
    blockLimit: number,
    extraData = '0x0',
) {
    const tx = new Transaction({
        data: bin.startsWith('0x') ? bin : ('0x' + bin),
        from: address,
        gas: 1000000,
        randomid: randomBytes(16),
        blockLimit,
        chainId: chainID,
        groupId: groupID,
        extraData
    });
    tx.sign(privateKey);
    return tx.serialize();
}
