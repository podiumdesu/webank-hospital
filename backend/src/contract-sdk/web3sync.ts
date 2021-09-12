import { randomUUID } from 'crypto';

import { Transaction } from './transactionObject';

import { Configuration } from './config';

export function genRandomID() {
    return '0x' + randomUUID().replace(/-/g, '');
}

export function getSignTx(config: Configuration, to: string, txData: string, blockLimit: number) {
    let groupID = config.groupID;
    let account = config.account.address;
    let privateKey = Buffer.from(config.account.privateKey, 'hex');
    let chainID = config.chainID;

    let postdata = {
        data: txData,
        from: account,
        to,
        gas: 1000000,
        randomid: genRandomID(),
        blockLimit,
        chainId: chainID,
        groupId: groupID,
        extraData: '0x0'
    };

    let tx = new Transaction(postdata);
    tx.sign(privateKey);
    // Build a serialized hex version of the tx
    return `0x${tx.serialize().toString('hex')}`;
}

export function getSignDeployTx(config: Configuration, bin: string, blockLimit: number) {
    let groupID = config.groupID;
    let account = config.account.address;
    let privateKey = Buffer.from(config.account.privateKey, 'hex');
    let chainID = config.chainID;
    let txData = bin.startsWith('0x') ? bin : ('0x' + bin);

    let postdata = {
        data: txData,
        from: account,
        to: null,
        gas: 1000000,
        randomid: genRandomID(),
        blockLimit,
        chainId: chainID,
        groupId: groupID,
        extraData: '0x0'
    };

    let tx = new Transaction(postdata);
    tx.sign(privateKey);
    // Build a serialized hex version of the tx
    return `0x${tx.serialize().toString('hex')}`;
}
