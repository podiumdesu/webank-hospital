import { utils } from 'ethers';
import { encode } from '@ethersproject/rlp';
import { ecdsaSign, publicKeyCreate } from 'secp256k1';
import { hexToUint8Array } from '#/utils/codec';
import { keccak_256 } from 'js-sha3';
import axios from 'axios';
import { ENDPOINT } from '#/constants';

const addresses = {
    ca: '0x47d43107ff3097acfcf4182b5fd612e460c430a2',
    meta: '0x8fe657c4a8014aa564dc9c73790d0b9c7de8d7f4',
    record: '0x04f74d393d09e8f5b044b4f2f984ac7e88822f6d',
    trace: '0x41d838b4a0adf5c469d613dd7b1cc4d4c94d2c51'
};

export class ClientConfig {
    constructor(privateKey, groupId = 1, chainId = 1) {
        this.privateKey = hexToUint8Array(privateKey);
        this.groupId = groupId;
        this.chainId = chainId;
    }

    get address() {
        return utils.computeAddress(this.privateKey);
    }

    get publicKey() {
        return publicKeyCreate(this.privateKey);
    }
}

const signAndSerialize = (transaction, privateKey) => {
    const data = [
        'randomid', 'gasPrice', 'gas', 'blockLimit', 'to', 'value', 'data', 'chainId', 'groupId', 'extraData'
    ].map((key) => utils.arrayify(transaction[key] ?? new Uint8Array()));
    const { signature, recid } = ecdsaSign(new Uint8Array(keccak_256.update(hexToUint8Array(encode(data).slice(2))).arrayBuffer()), privateKey);
    return encode(data.concat([
        new Uint8Array([recid + 27]),
        signature.slice(0, 32),
        signature.slice(32, 64),
    ]));
};

const getSignTx = ({ groupId, address, privateKey, chainId }, to, txData, blockLimit) => signAndSerialize({
    data: txData,
    from: address,
    to,
    gas: 1000000,
    randomid: crypto.getRandomValues(new Uint8Array(16)),
    blockLimit,
    chainId,
    groupId,
    extraData: '0x00'
}, privateKey);

const getSignDeployTx = ({ groupId, address, privateKey, chainId }, bin, blockLimit, extraData = '0x00') => signAndSerialize({
    data: `0x${bin}`,
    from: address,
    gas: 1000000,
    randomid: crypto.getRandomValues(new Uint8Array(16)),
    blockLimit,
    chainId,
    groupId,
    extraData
}, privateKey);

class Client {
    constructor(config) {
        this.config = config;
    }

    async request(method, params, isQuery = true) {
        return (await axios.post(`${ENDPOINT}/rpc`, {
            method,
            params,
            isQuery,
        })).data;
    }

    getBlockNumber() {
        return this.request('getBlockNumber', [this.config.groupId]);
    }

    getPbftView() {
        return this.request('getPbftView', [this.config.groupId]);
    }

    getObserverList() {
        return this.request('getObserverList', [this.config.groupId]);
    }

    getSealerList() {
        return this.request('getSealerList', [this.config.groupId]);
    }

    getConsensusStatus() {
        return this.request('getConsensusStatus', [this.config.groupId]);
    }

    getSyncStatus() {
        return this.request('getSyncStatus', [this.config.groupId]);
    }

    getClientVersion() {
        return this.request('getClientVersion', [this.config.groupId]);
    }

    getPeers() {
        return this.request('getPeers', [this.config.groupId]);
    }

    getNodeIDList() {
        return this.request('getNodeIDList', [this.config.groupId]);
    }

    getGroupPeers() {
        return this.request('getGroupPeers', [this.config.groupId]);
    }

    getGroupList() {
        return this.request('getGroupList', [this.config.groupId]);
    }

    getBlockByHash(blockHash, includeTransactions) {
        return this.request('getBlockByHash', [this.config.groupId, blockHash, includeTransactions]);
    }

    getBlockByNumber(blockNumber, includeTransactions) {
        return this.request('getBlockByNumber', [this.config.groupId, blockNumber, includeTransactions]);
    }

    getBlockHashByNumber(blockNumber) {
        return this.request('getBlockHashByNumber', [this.config.groupId, blockNumber]);
    }

    getTransactionByHash(transactionHash) {
        return this.request('getTransactionByHash', [this.config.groupId, transactionHash]);
    }

    getTransactionByBlockHashAndIndex(blockHash, transactionIndex) {
        return this.request('getTransactionByBlockHashAndIndex', [this.config.groupId, blockHash, transactionIndex]);
    }

    getTransactionByBlockNumberAndIndex(blockNumber, transactionIndex) {
        return this.request('getTransactionByBlockNumberAndIndex', [this.config.groupId, blockNumber, transactionIndex]);
    }

    getPendingTransactions() {
        return this.request('getPendingTransactions', [this.config.groupId]);
    }

    getPendingTxSize() {
        return this.request('getPendingTxSize', [this.config.groupId]);
    }

    getTotalTransactionCount() {
        return this.request('getTotalTransactionCount', [this.config.groupId]);
    }

    getTransactionReceipt(txHash) {
        return this.request('getTransactionReceipt', [this.config.groupId, txHash]);
    }

    getCode(address) {
        return this.request('getCode', [this.config.groupId, address]);
    }

    getSystemConfigByKey(key) {
        return this.request('getSystemConfigByKey', [this.config.groupId, key]);
    }

    async sendRawTransaction(to, f, params) {
        const iface = new utils.Interface([f]);
        const func = Object.values(iface.functions)[0];

        const blockNumber = parseInt((await this.getBlockNumber()).result, 16);
        const txData = `${iface.getSighash(func)}${iface._encodeParams(func.inputs, params).slice(2)}`;
        const signTx = getSignTx(this.config, to, txData, blockNumber + 500);
        const { status, statusMsg, output } = await this.request('sendRawTransaction', [this.config.groupId, signTx], false);
        if (parseInt(status, 16)) {
            throw new Error(statusMsg);
        } else {
            return utils.defaultAbiCoder.decode(func.outputs, output);
        }
    }

    async deploy(abi, bin, parameters) {
        const contractAbi = new utils.Interface(abi);
        const inputs = contractAbi.deploy.inputs;

        const paramsBin = contractAbi._encodeParams(inputs, parameters);

        const blockNumber = parseInt((await this.getBlockNumber()).result, 16);
        const signTx = bin.startsWith('0061736d')
            ? getSignDeployTx(this.config, bin, blockNumber + 500, paramsBin)
            : getSignDeployTx(this.config, bin + paramsBin.slice(2), blockNumber + 500);
        return this.request('sendRawTransaction', [this.config.groupId, signTx], false);
    }

    async call(to, f, params) {
        const iface = new utils.Interface([f]);
        const func = Object.values(iface.functions)[0];

        const { result: { output, status } } = await this.request('call', [this.config.groupId, {
            from: this.config.address,
            to,
            value: '0x0',
            data: `${iface.getSighash(func)}${iface._encodeParams(func.inputs, params).slice(2)}`
        }]);
        if (parseInt(status, 16)) {
            throw new Error(`Failed to call ${f}`);
        } else {
            return utils.defaultAbiCoder.decode(func.outputs, output);
        }
    }
}

export class API {
    constructor(config) {
        this.client = new Client(config);
    }

    async getRecord(aid) {
        return await this.client.call(
            addresses.record,
            'function get_ca(string memory aid) public view returns (string[2] memory, uint64)',
            [aid],
        );
    }

    async getReEncryptedRecord(bid) {
        return await this.client.call(
            addresses.record,
            'function get_cb(string memory bid) public view returns (string[2] memory, uint64)',
            [bid],
        );
    }

    async setRecord(aid, ca) {
        await this.client.sendRawTransaction(
            addresses.record,
            'function set(string memory aid, string[2] memory ca) public',
            [aid, ca],
        );
    }

    async reEncrypt(aid, bid, rk) {
        await this.client.sendRawTransaction(
            addresses.record,
            'function re_encrypt(string memory aid, string memory bid, string memory rk) public',
            [aid, bid, rk],
        );
    }

    async getTrace(id) {
        const [length] = await this.client.call(
            addresses.trace,
            'function get_trace_length(string memory id) public view returns (uint32)',
            [id],
        );
        return await Promise.all([...new Array(length).keys()].map(async (i) => {
            return await this.client.call(
                addresses.trace,
                'function get_trace_item(string memory id, uint32 index) public view returns (string memory, uint64)',
                [id, i],
            );
        }));
    }

    async setTrace(id, c, proof) {
        await this.client.sendRawTransaction(
            addresses.trace,
            'function set(string memory id, string memory c, string memory proof) public',
            [id, c, proof],
        );
    }

    async getBlockHash() {
        const { result } = await this.client.getBlockNumber();
        const { result: { hash } } = await this.client.getBlockByNumber((+result).toString(), false);
        return hash.slice(2);
    }

    async verify(address, hash, v, r, s, timestamp) {
        const [valid] = await this.client.call(
            addresses.ca,
            'function isValid(address member, bytes32 hash, uint8 v, bytes32 r, bytes32 s, uint timestamp) public view returns (bool)',
            [address, hash, v, r, s, timestamp],
        );
        return valid;
    }
}
