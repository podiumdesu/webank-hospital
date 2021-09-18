import { config } from './config';
import { Web3jService } from './contract-sdk';

const web3j = new Web3jService(config);

web3j.getBlockHeight().then(console.log, console.error);
web3j.getPbftView().then(console.log, console.error);

web3j.sendRawTransaction(
    '0x0000000000000000000000000000000000005007',
    'function generatorGen(string g, string h) public pure returns (string, string)',
    ['foo', 'bar']
).then(console.log, console.error);

web3j.call(
    '0x0000000000000000000000000000000000005007',
    'function generatorGen(string g, string h) public pure returns (string, string)',
    ['foo', 'bar']
).then(console.log, console.error);
