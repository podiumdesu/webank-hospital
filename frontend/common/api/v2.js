import { utils } from 'ethers';
import { encode } from '@ethersproject/rlp';
import { ecdsaSign } from 'secp256k1';
import { hexToUint8Array } from '#/utils/codec'
import axios from 'axios';
import { API } from '#/constants';

const addresses = {
    record: '0x9cb6ae3860995b076920ef1eb8f5ccea8795cbcb',
    meta: '0xca22a148c68be6c78337cfdb3011b9f0c4b08e97',
    trace: '0xadc44d3d2c2e02611a0d522662ec95fa51ed017c',
};

export const clientConfig = {
    account: {
        privateKey: hexToUint8Array('744610fbe6fdd90f9e4cdfc3e3fdaf3d1d6b8b50848df4cbd3a07301a2755b2a'), //  openssl ec -in a -text -noout
        address: '0x440bc044b9dac7b0f2aadc735d62b7c7f851d053',
    },
    groupID: 1,
    chainID: 1,
};

const padToEven = (str) => str.length % 2 ? `0${str}` : str;

class Transaction {
    raw = [];
    sig = [
        new Uint8Array([0x1c]), // v
        new Uint8Array(), // r
        new Uint8Array() // s
    ];

    constructor(data) {
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
            if (value instanceof Uint8Array) {
                return value;
            }
            switch (typeof value) {
                case 'number':
                    return hexToUint8Array(padToEven(value.toString(16)));
                case 'string':
                    return hexToUint8Array(padToEven(value.slice(2)));
                default:
                    return new Uint8Array();
            }
        })
    }

    serialize() {
        return encode([...this.raw, ...this.sig]);
    }

    sign(privateKey) {
        const { signature, recid } = ecdsaSign(crypto.getRandomValues(new Uint8Array(32)), privateKey);
        this.sig = [
            new Uint8Array([recid + 27]),
            signature.slice(0, 32),
            signature.slice(32, 64),
        ]
    }
}

const getSignTx = (
    { groupID, account: { address, privateKey }, chainID },
    to,
    txData,
    blockLimit
) => {
    const tx = new Transaction({
        data: txData,
        from: address,
        to,
        gas: 1000000,
        randomid: crypto.getRandomValues(new Uint8Array(16)),
        blockLimit,
        chainId: chainID,
        groupId: groupID,
        extraData: '0x0'
    });
    tx.sign(privateKey);
    return tx.serialize();
};

const getSignDeployTx = (
    { groupID, account: { address, privateKey }, chainID },
    bin,
    blockLimit,
    extraData = '0x0',
) => {
    const tx = new Transaction({
        data: bin.startsWith('0x') ? bin : ('0x' + bin),
        from: address,
        gas: 1000000,
        randomid: crypto.getRandomValues(new Uint8Array(16)),
        blockLimit,
        chainId: chainID,
        groupId: groupID,
        extraData
    });
    tx.sign(privateKey);
    return tx.serialize();
};

class Web3jService {
    constructor(config) {
        this.config = config;
    }

    async request(method, params, isQuery = true) {
        return (await axios.post(`${API}/rpc`, {
            method,
            params,
            isQuery,
        })).data;
    }

    getBlockNumber() {
        return this.request('getBlockNumber', [this.config.groupID]);
    }

    getPbftView() {
        return this.request('getPbftView', [this.config.groupID]);
    }

    getObserverList() {
        return this.request('getObserverList', [this.config.groupID]);
    }

    getSealerList() {
        return this.request('getSealerList', [this.config.groupID]);
    }

    getConsensusStatus() {
        return this.request('getConsensusStatus', [this.config.groupID]);
    }

    getSyncStatus() {
        return this.request('getSyncStatus', [this.config.groupID]);
    }

    getClientVersion() {
        return this.request('getClientVersion', [this.config.groupID]);
    }

    getPeers() {
        return this.request('getPeers', [this.config.groupID]);
    }

    getNodeIDList() {
        return this.request('getNodeIDList', [this.config.groupID]);
    }

    getGroupPeers() {
        return this.request('getGroupPeers', [this.config.groupID]);
    }

    getGroupList() {
        return this.request('getGroupList', [this.config.groupID]);
    }

    getBlockByHash(blockHash, includeTransactions) {
        return this.request('getBlockByHash', [this.config.groupID, blockHash, includeTransactions]);
    }

    getBlockByNumber(blockNumber, includeTransactions) {
        return this.request('getBlockByNumber', [this.config.groupID, blockNumber, includeTransactions]);
    }

    getBlockHashByNumber(blockNumber) {
        return this.request('getBlockHashByNumber', [this.config.groupID, blockNumber]);
    }

    getTransactionByHash(transactionHash) {
        return this.request('getTransactionByHash', [this.config.groupID, transactionHash]);
    }

    getTransactionByBlockHashAndIndex(blockHash, transactionIndex) {
        return this.request('getTransactionByBlockHashAndIndex', [this.config.groupID, blockHash, transactionIndex]);
    }

    getTransactionByBlockNumberAndIndex(blockNumber, transactionIndex) {
        return this.request('getTransactionByBlockNumberAndIndex', [this.config.groupID, blockNumber, transactionIndex]);
    }

    getPendingTransactions() {
        return this.request('getPendingTransactions', [this.config.groupID]);
    }

    getPendingTxSize() {
        return this.request('getPendingTxSize', [this.config.groupID]);
    }

    getTotalTransactionCount() {
        return this.request('getTotalTransactionCount', [this.config.groupID]);
    }

    getTransactionReceipt(txHash) {
        return this.request('getTransactionReceipt', [this.config.groupID, txHash]);
    }

    getCode(address) {
        return this.request('getCode', [this.config.groupID, address]);
    }

    getSystemConfigByKey(key) {
        return this.request('getSystemConfigByKey', [this.config.groupID, key]);
    }

    async sendRawTransaction(to, f, params) {
        const iface = new utils.Interface([f]);
        const func = Object.values(iface.functions)[0];

        const blockNumber = parseInt((await this.getBlockNumber()).result, 16);
        const txData = `${iface.getSighash(func)}${iface._encodeParams(func.inputs, params).slice(2)}`;
        const signTx = getSignTx(this.config, to, txData, blockNumber + 500);
        const { status, statusMsg, output } = await this.request('sendRawTransaction', [this.config.groupID, signTx], false);
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
        return this.request('sendRawTransaction', [this.config.groupID, signTx], false);
    }

    async call(to, f, params) {
        const iface = new utils.Interface([f]);
        const func = Object.values(iface.functions)[0];

        const { result: { output, status } } = await this.request('call', [this.config.groupID, {
            from: this.config.account.address,
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

const service = new Web3jService(clientConfig);

export const getRecord = async (id) => {
    const [key] = await service.call(
        addresses.record,
        'function get(string memory id) public view returns (string[2] memory)',
        [id],
    );
    return key;
};
export const setRecord = async (id, ca) => {
    await service.sendRawTransaction(
        addresses.record,
        'function set(string memory id, string[2] memory key) public',
        [id, ca],
    );
}
export const reEncrypt = async (id, rk) => {
    const [cb] = await service.call(
        addresses.record,
        'function reEncrypt(string memory id, string memory rk) public view returns (string[2] memory)',
        [id, rk],
    );
    return cb;
};

export const getTrace = async (id) => {
    const [length] = await service.call(
        addresses.trace,
        'function get_trace_length(string memory id) public view returns (uint32)',
        [id],
    );
    return await Promise.all([...new Array(length).keys()].map(async (i) => {
        const [item] = await service.call(
            addresses.trace,
            'function get_trace_item(string memory id, uint32 index) public view returns (string memory id)',
            [id, i],
        );
        return item;
    }));
};
export const setTrace = async (id, c, proof) => {
    await service.sendRawTransaction(
        addresses.trace,
        'function set(string memory id, string memory c, string memory proof) public',
        [id, c, proof],
    );
};

export const getBlockHash = async () => {
    const { result } = await service.getBlockNumber();
    const { result: { hash } } = await service.getBlockByNumber((+result).toString(), false);
    return hash.slice(2);
};
