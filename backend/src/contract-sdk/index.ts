import assert from 'assert';

import { utils } from 'ethers';

import { channelPromise, MESSAGE_TYPE, registerBlockNotifyCallback } from './network';

import { getSignDeployTx, getSignTx } from './web3sync';

import { Configuration } from './config';
import { JsonFragment } from '@ethersproject/abi';

const QUERY = MESSAGE_TYPE.QUERY;
const TRANSACTION = MESSAGE_TYPE.CHANNEL_RPC_REQUEST;

let blockHeightRecords = new Map();

function updateBlockHeight(groupID: number, blockHeight: number) {
    if (!blockHeightRecords.has(groupID) || blockHeight > blockHeightRecords.get(groupID)) {
        blockHeightRecords.set(groupID, blockHeight);
    }
}

export class Web3jService {
    constructor(public config: Configuration) {
    }

    _constructRequest(method: string, params: unknown[], type = QUERY) {
        return channelPromise({
            'jsonrpc': '2.0',
            method,
            params,
            'id': 1
        }, type, this.config.nodes[~~(Math.random() * this.config.nodes.length)], this.config.authentication, this.config.timeout);
    }

    async getBlockHeight() {
        const { groupID, nodes, authentication } = this.config;
    
        if (!blockHeightRecords.has(groupID)) {
            let blockHeight: any = await this.getBlockNumber();
            blockHeight = parseInt(blockHeight.result, 16);
            blockHeightRecords.set(groupID, blockHeight);
            // send block notify registration to all known nodes to get an accurate block height
            for (let node of nodes) {
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

    async sendRawTransaction(to: string, f: JsonFragment, params: unknown[]) {
        let iface = new utils.Interface([f]);
        const func = iface.getFunction(f.name!);

        let blockNumber = await this.getBlockHeight();
        let txData = `${iface.getSighash(func)}${iface._encodeParams(func.inputs, params).slice(2)}`;
        let signTx = this._rawTransaction(to, txData, blockNumber + 500);
        return this._constructRequest('sendRawTransaction', [this.config.groupID, signTx], TRANSACTION);
    }

    async deploy(abi: JsonFragment[], bin: string, parameters: unknown[]) {
        let contractAbi = new utils.Interface(abi);
        let inputs = contractAbi.deploy.inputs;
        assert(inputs.length === parameters.length);

        let contractBin = bin;
        if (parameters.length) {
            contractBin += contractAbi._encodeParams(inputs, parameters);
        }

        let blockNumber = await this.getBlockHeight();
        let signTx = getSignDeployTx(this.config, contractBin, blockNumber + 500);
        return this._constructRequest('sendRawTransaction', [this.config.groupID, signTx], TRANSACTION);
    }

    call(to: string, f: JsonFragment, params: unknown[]) {
        let iface = new utils.Interface([f]);
        const func = iface.getFunction(f.name!);

        let txData = `${iface.getSighash(func)}${iface._encodeParams(func.inputs, params).slice(2)}`;
        return this._constructRequest('call', [this.config.groupID, {
            'from': this.config.account.address,
            'to': to,
            'value': '0x0',
            'data': txData
        }]);
    }
}
