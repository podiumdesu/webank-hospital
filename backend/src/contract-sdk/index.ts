import assert from 'assert';
import { utils } from 'ethers';
import { Configuration } from './config';
import { channelPromise, MESSAGE_TYPE, registerBlockNotifyCallback } from './network';
import { getSignDeployTx, getSignTx } from './web3sync';

const QUERY = MESSAGE_TYPE.QUERY;
const TRANSACTION = MESSAGE_TYPE.CHANNEL_RPC_REQUEST;

const blockHeightRecords = new Map();

function updateBlockHeight(groupID: number, blockHeight: number) {
    if (!blockHeightRecords.has(groupID) || blockHeight > blockHeightRecords.get(groupID)) {
        blockHeightRecords.set(groupID, blockHeight);
    }
}

export class Web3jService {
    constructor(public config: Configuration) {
    }

    _constructRequest<T>(method: string, params: unknown[], type = QUERY) {
        return channelPromise<T>({
            'jsonrpc': '2.0',
            method,
            params,
            'id': 1
        }, type, this.config.nodes[~~(Math.random() * this.config.nodes.length)], this.config.authentication, this.config.timeout);
    }

    async getBlockHeight() {
        const { groupID, nodes, authentication } = this.config;

        if (!blockHeightRecords.has(groupID)) {
            const blockHeight: any = await this.getBlockNumber();
            blockHeightRecords.set(groupID, parseInt(blockHeight.result, 16));
            // send block notify registration to all known nodes to get an accurate block height
            for (const node of nodes) {
                registerBlockNotifyCallback(groupID, updateBlockHeight, node, authentication);
            }
            return blockHeightRecords.get(groupID);
        }
        return blockHeightRecords.get(groupID);
    }

    getBlockNumber() {
        return this._constructRequest('getBlockNumber', [this.config.groupID]);
    }

    getPbftView() {
        return this._constructRequest('getPbftView', [this.config.groupID]);
    }

    getObserverList() {
        return this._constructRequest('getObserverList', [this.config.groupID]);
    }

    getSealerList() {
        return this._constructRequest('getSealerList', [this.config.groupID]);
    }

    getConsensusStatus() {
        return this._constructRequest('getConsensusStatus', [this.config.groupID]);
    }

    getSyncStatus() {
        return this._constructRequest('getSyncStatus', [this.config.groupID]);
    }

    getClientVersion() {
        return this._constructRequest('getClientVersion', [this.config.groupID]);
    }

    getPeers() {
        return this._constructRequest('getPeers', [this.config.groupID]);
    }

    getNodeIDList() {
        return this._constructRequest('getNodeIDList', [this.config.groupID]);
    }

    getGroupPeers() {
        return this._constructRequest('getGroupPeers', [this.config.groupID]);
    }

    getGroupList() {
        return this._constructRequest('getGroupList', [this.config.groupID]);
    }

    getBlockByHash(blockHash: string, includeTransactions: boolean) {
        return this._constructRequest('getBlockByHash', [this.config.groupID, blockHash, includeTransactions]);
    }

    getBlockByNumber(blockNumber: string, includeTransactions: boolean) {
        return this._constructRequest('getBlockByNumber', [this.config.groupID, blockNumber, includeTransactions]);
    }

    getBlockHashByNumber(blockNumber: string) {
        return this._constructRequest('getBlockHashByNumber', [this.config.groupID, blockNumber]);
    }

    getTransactionByHash(transactionHash: string) {
        return this._constructRequest('getTransactionByHash', [this.config.groupID, transactionHash]);
    }

    getTransactionByBlockHashAndIndex(blockHash: string, transactionIndex: string) {
        return this._constructRequest('getTransactionByBlockHashAndIndex', [this.config.groupID, blockHash, transactionIndex]);
    }

    getTransactionByBlockNumberAndIndex(blockNumber: string, transactionIndex: string) {
        return this._constructRequest('getTransactionByBlockNumberAndIndex', [this.config.groupID, blockNumber, transactionIndex]);
    }

    getPendingTransactions() {
        return this._constructRequest('getPendingTransactions', [this.config.groupID]);
    }

    getPendingTxSize() {
        return this._constructRequest('getPendingTxSize', [this.config.groupID]);
    }

    getTotalTransactionCount() {
        return this._constructRequest('getTotalTransactionCount', [this.config.groupID]);
    }

    getTransactionReceipt(txHash: string) {
        return this._constructRequest('getTransactionReceipt', [this.config.groupID, txHash]);
    }

    getCode(address: string) {
        return this._constructRequest('getCode', [this.config.groupID, address]);
    }

    getSystemConfigByKey(key: string) {
        return this._constructRequest('getSystemConfigByKey', [this.config.groupID, key]);
    }

    _rawTransaction(to: string, txData: string, blockLimit: number) {
        return getSignTx(this.config, to, txData, blockLimit);
    }

    async sendRawTransaction(to: string, f: string, params: unknown[]) {
        const iface = new utils.Interface([f]);
        const func = Object.values(iface.functions)[0];

        const blockNumber = await this.getBlockHeight();
        const txData = `${iface.getSighash(func)}${iface._encodeParams(func.inputs, params).slice(2)}`;
        const signTx = this._rawTransaction(to, txData, blockNumber + 500);
        const { status, statusMsg, output } = await this._constructRequest<{
            status: string;
            statusMsg: string;
            output: string;
        }>('sendRawTransaction', [this.config.groupID, signTx], TRANSACTION);
        if (parseInt(status, 16)) {
            throw new Error(statusMsg);
        } else {
            return utils.defaultAbiCoder.decode(func.outputs!, output);
        }
    }

    async deploy(abi: string, bin: string, parameters: unknown[]) {
        const contractAbi = new utils.Interface(abi);
        const inputs = contractAbi.deploy.inputs;
        assert(inputs.length === parameters.length);

        let contractBin = bin;
        if (parameters.length) {
            contractBin += contractAbi._encodeParams(inputs, parameters);
        }

        const blockNumber = await this.getBlockHeight();
        const signTx = getSignDeployTx(this.config, contractBin, blockNumber + 500);
        return this._constructRequest<{ contractAddress: string }>('sendRawTransaction', [this.config.groupID, signTx], TRANSACTION);
    }

    async call(to: string, f: string, params: unknown[]) {
        const iface = new utils.Interface([f]);
        const func = Object.values(iface.functions)[0];

        const { result: { output, status } } = await this._constructRequest<{
            result: {
                output: string;
                status: string;
            }
        }>('call', [this.config.groupID, {
            from: this.config.account.address,
            to,
            value: '0x0',
            data: `${iface.getSighash(func)}${iface._encodeParams(func.inputs, params).slice(2)}`
        }]);
        if (parseInt(status, 16)) {
            throw new Error(`Failed to call ${f}`);
        } else {
            return utils.defaultAbiCoder.decode(func.outputs!, output);
        }
    }
}
