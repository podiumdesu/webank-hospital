import fastify from 'fastify';
import cors from 'fastify-cors';

import { clientConfig, addresses } from './config';
import { Web3jService } from './contract-sdk';

const web3j = new Web3jService(clientConfig);
const server = fastify({ logger: true });

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
        'function reEncrypt(string memory id, string memory rk) public view returns (string[2] memory)',
        [id, rk],
    );
    res.send(cb);
});

server.listen(5000);
