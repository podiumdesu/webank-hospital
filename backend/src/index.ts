import fastify from 'fastify';
import cors from 'fastify-cors';

import { clientConfig, addresses } from './config';
import { Web3jService } from './contract-sdk';
import { channelPromise, MESSAGE_TYPE } from './contract-sdk/network';

const web3j = new Web3jService(clientConfig);
const server = fastify({
    logger: true,
    maxParamLength: 192
});

server.register(cors);

server.get<{ Params: { id: string } }>('/records/:id', async ({ params: { id } }, res) => {
    const [key] = await web3j.call(
        addresses.record,
        'function get(string memory id) public view returns (string[2] memory)',
        [id],
    );
    res.send(key);
});

server.post<{ Params: { id: string }, Body: [string, string] }>('/records/:id', async ({ params: { id }, body: [ca0, ca1] }, res) => {
    await web3j.sendRawTransaction(
        addresses.record,
        'function set(string memory id, string[2] memory key) public',
        [id, [ca0, ca1]],
    );
    res.send();
});

server.get<{ Params: { id: string, rk: string } }>('/records/:id/rk/:rk', async ({ params: { id, rk } }, res) => {
    const [cb] = await web3j.call(
        addresses.record,
        'function re_encrypt(string memory id, string memory rk) public view returns (string[2] memory)',
        [id, rk],
    );
    res.send(cb);
});

server.get('/status/hash', async (_, res) => {
    const height = await web3j.getBlockHeight();
    const { result: { hash } } = await web3j.getBlockByNumber(height!.toString(), false);
    res.send(hash.slice(2));
});

server.get<{ Params: { id: string } }>('/traces/:id', async ({ params: { id } }, res) => {
    const [length] = await web3j.call(
        addresses.trace,
        'function get_trace_length(string memory id) public view returns (uint32)',
        [id],
    );
    res.send(await Promise.all([...new Array(length).keys()].map(async (i) => {
        const [item] = await web3j.call(
            addresses.trace,
            'function get_trace_item(string memory id, uint32 index) public view returns (string memory id)',
            [id, i],
        );
        return item;
    })));
});

server.post<{ Params: { id: string }, Body: { c: string, proof: string } }>('/traces/:id', async ({ params: { id }, body: { c, proof } }, res) => {
    res.send(await web3j.sendRawTransaction(
        addresses.trace,
        'function set(string memory id, string memory c, string memory proof) public',
        [id, c, proof],
    ));
});

const { nodes, authentication, timeout } = clientConfig;

server.post<{ Body: { method: string, params: unknown[], isQuery: boolean } }>('/rpc', async ({ body: { method, params, isQuery } }, res) => {
    res.send(await channelPromise(
        { jsonrpc: '2.0', method, params, id: 1 },
        isQuery ? MESSAGE_TYPE.QUERY : MESSAGE_TYPE.CHANNEL_RPC_REQUEST,
        nodes[~~(Math.random() * nodes.length)],
        authentication,
        timeout
    ));
});

server.listen(5000);
