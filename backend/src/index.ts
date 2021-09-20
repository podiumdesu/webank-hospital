import fastify from 'fastify';

import { clientConfig, addresses } from './config';
import { Web3jService } from './contract-sdk';

const web3j = new Web3jService(clientConfig);
const server = fastify({ logger: true });

server.get<{ Params: { id: string } }>('/records/:id', async ({ params: { id } }, res) => {
    const [key] = await web3j.call(
        addresses.record,
        'function get(string memory id) public view returns (string[2] memory)',
        [id],
    );
    res.send(key);
});

server.post<{ Params: { id: string }, Body: [string, string] }>('/records/:id', async ({ params: { id }, body: [ca0, ca1] }) => {
    await web3j.sendRawTransaction(
        addresses.record,
        'function set(string memory id, string[2] memory key) public',
        [id, [ca0, ca1]],
    );
});

server.get<{ Params: { id: string, pk: string } }>('/records/:id/rk/:pk', async ({ params: { id, pk } }, res) => {
    const [rk] = await web3j.call(
        addresses.record,
        'function reEncrypt(string memory id, string memory rk) public view returns (string[2] memory)',
        [id, pk],
    );
    res.send(rk);
});

server.listen(5000);
